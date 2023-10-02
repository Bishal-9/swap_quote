require("dotenv").config()

const ethers = require("ethers")
const get_abi = require("./get_abi")

const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const QUOTER_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
const QUOTER2_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"

const INFURA_URL =
    "https://mainnet.infura.io/v3/" +
    process.env.INFURA_API_KEY.toString().trim()
const provider = new ethers.JsonRpcProvider(INFURA_URL)

const token_in = WETH_ADDRESS
const token_out = USDC_ADDRESS
const fee = "3000"
const amount_in = ethers.parseEther("1")
const sqrt_price_limit_x96 = "0"

const main = async () => {
    const quoter_abi = await get_abi(QUOTER_ADDRESS)
    const quoter2_abi = await get_abi(QUOTER2_ADDRESS)

    const quoter_contract = new ethers.Contract(
        QUOTER_ADDRESS,
        quoter_abi,
        provider
    )
    const quoter2_contract = new ethers.Contract(
        QUOTER2_ADDRESS,
        quoter2_abi,
        provider
    )

    // Quoter Stimulation
    const amount_out = await quoter_contract
        .getFunction("quoteExactInputSingle")
        .staticCall(token_in, token_out, fee, amount_in, sqrt_price_limit_x96)
    console.log(
        "Amount Out from Quoter: ",
        ethers.formatUnits(amount_out?.toString(), 6)
    )

    console.log("\n\n-------------------------------------------------\n\n")

    // Quoter2 Stimulation
    const output = await quoter2_contract
        .getFunction("quoteExactInputSingle")
        .staticCall({
            tokenIn: token_in,
            tokenOut: token_out,
            fee,
            amountIn: amount_in,
            sqrtPriceLimitX96: sqrt_price_limit_x96,
        })
    console.log("Amount Out from Quoter2: ", ethers.formatUnits(output?.[0]?.toString(), 6))
    console.log("SqrtPriceX96 after from Quoter2: ", output?.[1])
    console.log("Initialized Ticker Crossed from Quoter2: ", output[2])
    console.log("Estimated Gas Fee from Quoter2: ", output[3])
}
main()
