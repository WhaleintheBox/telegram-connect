// Export des ABI des contrats
  export const BOX_ABI = [
    {
      "inputs": [],
      "name": "ADMIN_ROLE",
      "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "ORACLE_ROLE",
      "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "betToken",
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "box",
      "outputs": [
          {"internalType": "string", "name": "details", "type": "string"},
          {"internalType": "uint256", "name": "endTime", "type": "uint256"},
          {"internalType": "uint256", "name": "maxAmount", "type": "uint256"},
          {"internalType": "bool", "name": "isPublic", "type": "bool"},
          {"internalType": "bool", "name": "isSettled", "type": "bool"},
          {"internalType": "bool", "name": "isCancelled", "type": "bool"},
          {"internalType": "bool", "name": "outcome", "type": "bool"},
          {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "availableAmount", "type": "uint256"},
          {"internalType": "string", "name": "gameId", "type": "string"},
          {"internalType": "string", "name": "leagueId", "type": "string"},
          {"internalType": "string", "name": "sportId", "type": "string"}
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "cancelBox",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "claimWinnings",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [{"internalType": "string", "name": "prediction", "type": "string"}],
      "name": "createBet",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
  },
  {
      "inputs": [{"internalType": "string", "name": "prediction", "type": "string"}, {"internalType": "uint256", "name": "betAmount", "type": "uint256"}],
      "name": "createBetWithAmount",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [{"internalType": "string", "name": "_details", "type": "string"}, {"internalType": "uint256", "name": "_endTime", "type": "uint256"}, {"internalType": "uint256", "name": "_maxAmount", "type": "uint256"}, {"internalType": "bool", "name": "_isPublic", "type": "bool"}, {"components": [{"internalType": "string", "name": "who", "type": "string"}, {"internalType": "string", "name": "what", "type": "string"}, {"internalType": "string", "name": "when", "type": "string"}], "internalType": "struct BoxStorage.BoxEvent[]", "name": "_initialEvents", "type": "tuple[]"}, {"internalType": "string", "name": "_gameId", "type": "string"}, {"internalType": "string", "name": "_leagueId", "type": "string"}, {"internalType": "string", "name": "_sportId", "type": "string"}],
      "name": "createBox",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "getBoxCreator",
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "getBoxDetails",
      "outputs": [
          {"internalType": "string", "name": "", "type": "string"},
          {"internalType": "uint256", "name": "", "type": "uint256"},
          {"internalType": "bool", "name": "", "type": "bool"},
          {"internalType": "bool", "name": "", "type": "bool"},
          {"internalType": "uint256", "name": "", "type": "uint256"},
          {"internalType": "uint256", "name": "", "type": "uint256"},
          {"internalType": "bool", "name": "", "type": "bool"},
          {
              "components": [
                  {"internalType": "address", "name": "participant", "type": "address"},
                  {"internalType": "bool", "name": "prediction", "type": "bool"},
                  {"internalType": "uint256", "name": "amount", "type": "uint256"}
              ],
              "internalType": "struct BoxStorage.Bet[]",
              "name": "",
              "type": "tuple[]"
          },
          {
              "components": [
                  {"internalType": "string", "name": "who", "type": "string"},
                  {"internalType": "string", "name": "what", "type": "string"},
                  {"internalType": "string", "name": "when", "type": "string"}
              ],
              "internalType": "struct BoxStorage.BoxEvent[]",
              "name": "",
              "type": "tuple[]"
          },
          {"internalType": "string", "name": "", "type": "string"},
          {"internalType": "string", "name": "", "type": "string"},
          {"internalType": "string", "name": "", "type": "string"}
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
      "name": "getClaimedPayout",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [{"internalType": "address", "name": "participant", "type": "address"}, {"internalType": "bool", "name": "prediction", "type": "bool"}],
      "name": "getParticipantShare",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [{"internalType": "address", "name": "participant", "type": "address"}],
      "name": "getTotalWinningsClaimed",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [{"internalType": "address", "name": "participant", "type": "address"}],
      "name": "getWinningsToClaim",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {"internalType": "address", "name": "account", "type": "address"}],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "isBoxCreated",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "settleBetFromOracle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "stakingAddress",
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "useNativeToken",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
  }
] as const;
    
  export const FACTORY_ABI = [
        {"inputs":[{"internalType":"address","name":"_initialOracleAddress","type":"address"},{"internalType":"address","name":"_initialStakingAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
        {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"boxAddress","type":"address"},{"indexed":true,"internalType":"uint256","name":"boxIndex","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"}],"name":"BoxAdded","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"boxes","outputs":[{"internalType":"contract Box","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"string","name":"_details","type":"string"},{"internalType":"uint256","name":"_endTime","type":"uint256"},{"internalType":"uint256","name":"_maxAmount","type":"uint256"},{"internalType":"bool","name":"_isPublic","type":"bool"},{"internalType":"address","name":"_betTokenAddress","type":"address"},{"components":[{"internalType":"string","name":"who","type":"string"},{"internalType":"string","name":"what","type":"string"},{"internalType":"string","name":"when","type":"string"}],"internalType":"struct BoxStorage.BoxEvent[]","name":"_initialEvents","type":"tuple[]"},{"internalType":"string","name":"_gameId","type":"string"},{"internalType":"string","name":"_leagueId","type":"string"},{"internalType":"string","name":"_sportId","type":"string"}],"name":"createBox","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"creatorBoxes","outputs":[{"internalType":"contract Box","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"getBoxesCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"_creator","type":"address"}],"name":"getCreatorBoxes","outputs":[{"internalType":"contract Box[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"oracleAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_newOracleAddress","type":"address"}],"name":"setOracleAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_newStakingAddress","type":"address"}],"name":"setStakingAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"stakingAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}
] as const;
  
  export const ORACLE_ABI = [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "initialOperator",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "AccessControlBadConfirmation",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "neededRole",
              "type": "bytes32"
            }
          ],
          "name": "AccessControlUnauthorizedAccount",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "boxId",
              "type": "address"
            }
          ],
          "name": "BoxCancelled",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "contractAddress",
              "type": "address"
            }
          ],
          "name": "OracleContractCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "boxId",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "outcome",
              "type": "bool"
            }
          ],
          "name": "ResultSet",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "previousAdminRole",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "newAdminRole",
              "type": "bytes32"
            }
          ],
          "name": "RoleAdminChanged",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address"
            }
          ],
          "name": "RoleGranted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address"
            }
          ],
          "name": "RoleRevoked",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "DEFAULT_ADMIN_ROLE",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "OPERATOR_ROLE",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "boxId",
              "type": "address"
            }
          ],
          "name": "cancelBox",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "boxId",
              "type": "address"
            }
          ],
          "name": "getResult",
          "outputs": [
            {
              "internalType": "bool",
              "name": "isSettled",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "outcome",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "isCancelled",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            }
          ],
          "name": "getRoleAdmin",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "grantRole",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "hasRole",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "callerConfirmation",
              "type": "address"
            }
          ],
          "name": "renounceRole",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "results",
          "outputs": [
            {
              "internalType": "bool",
              "name": "isCancelled",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "isSettled",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "outcome",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "revokeRole",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "boxId",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "_outcome",
              "type": "bool"
            }
          ],
          "name": "setResult",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "interfaceId",
              "type": "bytes4"
            }
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
] as const;
  
  export const KRILL_ABI = [
        {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"AccountIsFrozen","type":"error"},
        {"inputs":[{"internalType":"address","name":"target","type":"address"}],"name":"AddressEmptyCode","type":"error"},
        {"inputs":[{"internalType":"uint256","name":"lastAirdropTime","type":"uint256"},{"internalType":"uint256","name":"requiredNextAirdropTime","type":"uint256"}],"name":"AirdropIntervalNotReached","type":"error"},
        {"inputs":[],"name":"CannotOperateOnZeroAddress","type":"error"},
        {"inputs":[],"name":"ContractDoesNotAcceptEther","type":"error"},
        {"inputs":[{"internalType":"address","name":"implementation","type":"address"}],"name":"ERC1967InvalidImplementation","type":"error"},
        {"inputs":[],"name":"ERC1967NonPayable","type":"error"},
        {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},
        {"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},
        {"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},
        {"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},
        {"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},
        {"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},
        {"inputs":[],"name":"FailedInnerCall","type":"error"},
        {"inputs":[],"name":"InvalidInitialization","type":"error"},
        {"inputs":[{"internalType":"uint256","name":"currentBalance","type":"uint256"},{"internalType":"uint256","name":"maxBalance","type":"uint256"}],"name":"MaxBalanceExceeded","type":"error"},
        {"inputs":[],"name":"NotInitializing","type":"error"},
        {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
        {"inputs":[],"name":"UUPSUnauthorizedCallContext","type":"error"},
        {"inputs":[{"internalType":"bytes32","name":"slot","type":"bytes32"}],"name":"UUPSUnsupportedProxiableUUID","type":"error"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Airdrop","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newAmount","type":"uint256"}],"name":"AirdropAmountUpdated","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newInterval","type":"uint256"}],"name":"AirdropIntervalUpdated","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Burned","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"}],"name":"Frozen","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint64","name":"version","type":"uint64"}],"name":"Initialized","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newMaxBalance","type":"uint256"}],"name":"MaxBalanceUpdated","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newMaxDailyReceive","type":"uint256"}],"name":"MaxDailyReceiveUpdated","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Minted","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"}],"name":"Unfrozen","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},
        {"inputs":[],"name":"UPGRADE_INTERFACE_VERSION","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"airdrop","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"freeze","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"getAirdropAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"getAirdropInterval","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"getMaxBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"getMaxDailyReceive","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"symbol_","type":"string"},{"internalType":"uint256","name":"initialSupply_","type":"uint256"},{"internalType":"address","name":"owner_","type":"address"},{"internalType":"uint256","name":"airdropAmount_","type":"uint256"},{"internalType":"uint256","name":"airdropInterval_","type":"uint256"},{"internalType":"uint256","name":"maxBalance_","type":"uint256"},{"internalType":"uint256","name":"maxDailyReceive_","type":"uint256"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"proxiableUUID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"newAirdropAmount","type":"uint256"}],"name":"setAirdropAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"newAirdropInterval","type":"uint256"}],"name":"setAirdropInterval","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"newMaxBalance","type":"uint256"}],"name":"setMaxBalance","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"newMaxDailyReceive","type":"uint256"}],"name":"setMaxDailyReceive","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"unfreeze","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},
        {"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},
        {"stateMutability":"payable","type":"receive"}
] as const;
  
  // Adresses des contrats
  export const ADDRESSES = {
    BASE: {
      FACTORY: '0x0f00Aa4fED7eeC77b3AbE92b5E75F97E54A83482',
      KRILL: '0x33E5b643C05a3B00F71a066FefA4F59eF6BE27fc',
      ORACLE: '0x75e2353F3079766cdb118285c868a15a4ce2Ec65'
    }
  } as const;
  
  // Type ERC20 basique pour les tokens
  export const ERC20_ABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address", 
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false, 
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;