import { Transaction } from "@mysten/sui/transactions";

/**
 * Club Contract SDK
 * Transaction builders for club-related operations
 */

/**
 * Query the deployed package to verify available functions
 * This helps diagnose ArityMismatch errors
 */
export async function verifyPackageFunctions(
  packageId: string,
  suiClient: any
): Promise<void> {
  try {
    const packageObject = await suiClient.getObject({
      id: packageId,
      options: { showContent: true },
    });

    console.log("📦 Package object:", packageObject);
    
    // Try to get normalized modules
    try {
      const normalizedModules = await suiClient.getNormalizedMoveModulesByPackage({
        package: packageId,
      });
      
      console.log("📚 Available modules:", Object.keys(normalizedModules));
      
      if (normalizedModules.club) {
        console.log("🏛️ Club module functions:", Object.keys(normalizedModules.club.exposedFunctions || {}));
        
        if (normalizedModules.club.exposedFunctions?.create_club) {
          const funcInfo = normalizedModules.club.exposedFunctions.create_club;
          
          // Count non-ctx parameters (ctx is always last and implicit in Move entry functions)
          const params = funcInfo.parameters || [];
          // Filter out TxContext parameter (usually last parameter)
          const userParams = params.filter((p: string) => !p.includes("TxContext"));
          const paramCount = userParams.length;
          
          console.log("✅ create_club function found:", {
            visibility: funcInfo.visibility,
            isEntry: funcInfo.isEntry,
            totalParams: params.length,
            userParams: paramCount,
            allParams: params,
            userParamTypes: userParams,
          });
          
          // Check if signature matches expected
          const expectedUserParamCount = 2; // name: String, description: String
          if (paramCount !== expectedUserParamCount) {
            console.error("❌ PARAMETER COUNT MISMATCH:", {
              expected: `${expectedUserParamCount} user parameters (name: String, description: String)`,
              actual: `${paramCount} user parameters`,
              actualParams: userParams,
              allParams: params,
              action: "Update the function call to match the deployed signature, or redeploy the contract with the correct signature",
            });
          } else {
            // Verify parameter types match
            const expectedTypes = ["String", "String"];
            const matches = userParams.every((p: string, idx: number) => 
              p.includes(expectedTypes[idx]) || p.includes("string")
            );
            if (!matches) {
              console.warn("⚠️ Parameter types may not match:", {
                expected: expectedTypes,
                actual: userParams,
              });
            } else {
              console.log("✅ Function signature matches expected signature");
            }
          }
        } else {
          console.warn("⚠️ create_club function not found in club module");
          console.log("Available functions:", Object.keys(normalizedModules.club.exposedFunctions || {}));
          
          // Check if it's in a different module
          if (normalizedModules.club_v2?.exposedFunctions?.create_club_as_admin) {
            console.warn("💡 Found create_club_as_admin in club_v2 module - you may need to use that instead");
          }
        }
      } else {
        console.warn("⚠️ Club module not found in package");
      }
    } catch (err) {
      console.warn("Could not get normalized modules:", err);
    }
  } catch (error) {
    console.error("Error querying package:", error);
  }
}

/**
 * Build a transaction to create a new club (Anyone can create)
 * Automatically issues ClubOwnerBadge to the creator (valid for 365 days)
 * 
 * Function signature: create_club(name: String, desc: String, clock: &Clock, ctx: &mut TxContext)
 * 
 * If you encounter ArityMismatch errors:
 * 1. Verify the package ID is correct
 * 2. Check that the deployed contract has create_club with the expected signature
 * 3. Use verifyPackageFunctions() to see the actual deployed signature
 */
export function buildCreateClubTx(
  packageId: string,
  clubName: string,
  description: string,
  clockObjectId: string = "0x6"
): Transaction {
  if (!packageId) {
    console.error("buildCreateClubTx: packageId is undefined");
    throw new Error("Package ID is required");
  }

  if (!clubName || clubName.trim() === "") {
    console.error("buildCreateClubTx: clubName is empty", { clubName });
    throw new Error("Club name is required");
  }

  if (!description || description.trim() === "") {
    console.error("buildCreateClubTx: description is empty", { description });
    throw new Error("Club description is required");
  }

  const tx = new Transaction();
  const functionTarget = `${packageId}::club_system::create_club`;
  
  // Trim inputs
  const trimmedName = clubName.trim();
  const trimmedDesc = description.trim();
  
  // Build the moveCall with name, desc, and clock
  // The function signature is: create_club(name: String, desc: String, clock: &Clock, ctx: &mut TxContext)
  tx.moveCall({
    target: functionTarget,
    arguments: [
      tx.pure.string(trimmedName), // name: String
      tx.pure.string(trimmedDesc), // desc: String
      tx.object(clockObjectId), // clock: &Clock
    ],
  });
  
  // Set gas budget
  tx.setGasBudget(100_000_000); // 100 MIST

  // Verify transaction has commands
  try {
    const txBlockData = (tx as any).blockData;
    if (txBlockData && (!txBlockData.transactions || txBlockData.transactions.length === 0)) {
      console.error("❌ Transaction has no commands after moveCall");
      throw new Error("Transaction block is empty - no commands were added");
    }
  } catch (verifyError) {
    // If we can't verify, log warning but continue
    console.warn("Could not verify transaction commands:", verifyError);
  }

  // Detailed logging for debugging
  console.log("✅ Transaction built for create_club:", {
    function: "create_club",
    packageId,
    target: functionTarget,
    arguments: {
      count: 3,
      types: ["String", "String", "&Clock"],
      values: {
        name: trimmedName,
        description: trimmedDesc,
        clockObjectId,
      },
    },
    expectedSignature: "create_club(name: String, desc: String, clock: &Clock, ctx: &mut TxContext)",
    note: "ctx is automatically provided by Sui runtime - not passed as argument. ClubOwnerBadge will be automatically issued to creator.",
  });

  return tx;
}

/**
 * Build a transaction to donate SUI to a club
 * Requires MemberBadge to donate
 * The transaction will split the amount from gas coin and donate it
 * 
 * Smart contract signature:
 * donate_to_club(_: &MemberBadge, club: &mut Club, payment: Coin<SUI>, ctx: &mut TxContext)
 */
export function buildDonateToClubTx(
  packageId: string,
  memberBadgeId: string,
  clubId: string,
  amountMist: bigint // Amount in MIST (1 SUI = 1,000,000,000 MIST)
): Transaction {
  if (!packageId) {
    throw new Error("Package ID is required");
  }

  if (!memberBadgeId || memberBadgeId.trim() === "") {
    throw new Error("Member Badge ID is required");
  }

  if (!clubId || clubId.trim() === "") {
    throw new Error("Club ID is required");
  }

  if (amountMist <= 0n) {
    throw new Error("Donation amount must be greater than 0");
  }

  const tx = new Transaction();

  // Split coin from gas for donation
  const [donationCoin] = tx.splitCoins(tx.gas, [amountMist]);

  // Call donate_to_club with the split coin
  tx.moveCall({
    target: `${packageId}::club_system::donate_to_club`,
    arguments: [
      tx.object(memberBadgeId), // MemberBadge
      tx.object(clubId),        // club: &mut Club
      donationCoin,             // payment: Coin<SUI>
    ],
  });

  tx.setGasBudget(100_000_000); // 100 MIST

  return tx;
}

// Note: update_club_name and delete_club functions are not available in the new contract

