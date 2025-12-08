export const PNS_REGISTRY_ADDRESS = "0x8AD694B00Aeb5c6973F988DB12102BF492146deF";


// Minimal ABI for PNS registry - only functions we need for marketplace
export const PNS_REGISTRY_ABI = [
    {
        "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
        "name": "ownerOf",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "names",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "string", "name": "name", "type": "string" }],
        "name": "getNameHash",
        "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "string", "name": "name", "type": "string" }],
        "name": "getNameRecord",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "expiresAt", "type": "uint256" },
                    { "internalType": "uint256", "name": "registeredAt", "type": "uint256" },
                    { "internalType": "bool", "name": "isPremium", "type": "bool" },
                    {
                        "components": [
                            { "internalType": "string", "name": "chainNamespace", "type": "string" },
                            { "internalType": "string", "name": "chainId", "type": "string" },
                            { "internalType": "bytes", "name": "owner", "type": "bytes" }
                        ],
                        "internalType": "struct UniversalAccountId",
                        "name": "originAccount",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct PushNameService.NameRecord",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
        "name": "getNamesByOwner",
        "outputs": [{ "internalType": "string[]", "name": "", "type": "string[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "from", "type": "address" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;
