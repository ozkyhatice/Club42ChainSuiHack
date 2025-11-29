import test from "node:test";
import assert from "node:assert/strict";
import {
  extractClubsFromRegistry,
} from "../src/services/blockchain/getClubs";

test("extractClubsFromRegistry returns empty array for invalid payload", async () => {
  const clubs = await extractClubsFromRegistry(null);
  assert.equal(clubs.length, 0);
});

test("extractClubsFromRegistry maps registry entries to clubs", async () => {
  const registry = {
    dataType: "moveObject",
    type: "mock::registry",
    fields: {
      clubs: {
        fields: {
          contents: [
            {
              fields: {
                key: "club-1",
                value: {
                  fields: {
                    owner: "0x1",
                    name: "Test Club",
                    description: "A test description",
                    events: {
                      fields: {
                        data: ["0xevent"],
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
    },
  };

  const clubs = await extractClubsFromRegistry(registry as any);
  assert.equal(clubs.length, 1);
  assert.equal(clubs[0]?.id, "club-1");
  assert.equal(clubs[0]?.name, "Test Club");
});

