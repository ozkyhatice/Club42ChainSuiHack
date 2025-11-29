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
 * Build a transaction to create a new club
 * The creator will receive a ClubAdminCap for the new club
 * 
 * Function signature: create_club(name: String, description: String, ctx: &mut TxContext)
 * Note: ctx is automatically provided by Sui runtime, so we only pass name and description
 * 
 * If you encounter ArityMismatch errors:
 * 1. Verify the package ID is correct
 * 2. Check that the deployed contract has create_club with the expected signature
 * 3. Use verifyPackageFunctions() to see the actual deployed signature
 */
export function buildCreateClubTx(
  packageId: string,
  clubName: string,
  description: string
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
  const functionTarget = `${packageId}::club::create_club`;
  
  // Trim inputs
  const trimmedName = clubName.trim();
  const trimmedDesc = description.trim();
  
  // Create pure string arguments using the standard Sui SDK method
  // Note: ctx parameter is automatically provided by Sui runtime, so we only pass name and description
  // The function signature is: create_club(name: String, description: String, ctx: &mut TxContext)
  const nameArg = tx.pure.string(trimmedName);
  const descArg = tx.pure.string(trimmedDesc);

  // Build the moveCall
  // IMPORTANT: If you get ArityMismatch, verify:
  // 1. The package ID is correct
  // 2. The deployed contract has create_club with signature: (name: String, description: String, ctx: &mut TxContext)
  // 3. Check browser console for verifyPackageFunctions() output to see actual deployed signature
    tx.moveCall({
      target: functionTarget,
      arguments: [nameArg, descArg],
    });
  
  // Set gas budget to get more detailed error messages
  // This helps with debugging ArityMismatch errors
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

  // Detailed logging for debugging ArityMismatch errors
  // If you see ArityMismatch, verify the deployed contract signature matches:
  // Expected: create_club(name: String, description: String, ctx: &mut TxContext)
  console.log("✅ Transaction built for create_club:", {
    function: "create_club",
    packageId,
    target: functionTarget,
    arguments: {
      count: 2,
      types: ["String", "String"],
      values: {
        name: trimmedName,
        description: trimmedDesc,
      },
    },
    expectedSignature: "create_club(name: String, description: String, ctx: &mut TxContext)",
    note: "ctx is automatically provided by Sui runtime - not passed as argument",
    troubleshooting: "If ArityMismatch occurs, verify deployed contract signature matches expected signature",
  });

  return tx;
}

/**
 * Build a transaction to update a club's name (admin only)
 */
export function buildUpdateClubNameTx(
  packageId: string,
  adminCapId: string,
  clubId: string,
  newName: string
): Transaction {
  if (!packageId || !adminCapId || !clubId || !newName) {
    throw new Error("All parameters are required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::club::update_club_name`,
    arguments: [
      tx.object(adminCapId),
      tx.object(clubId),
      tx.pure.string(newName),
    ],
  });

  return tx;
}

/**
 * Build a transaction to delete a club (admin only)
 */
export function buildDeleteClubTx(
  packageId: string,
  adminCapId: string,
  clubId: string
): Transaction {
  if (!packageId || !adminCapId || !clubId) {
    throw new Error("All parameters are required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::club::delete_club`,
    arguments: [tx.object(adminCapId), tx.object(clubId)],
  });

  return tx;
}

