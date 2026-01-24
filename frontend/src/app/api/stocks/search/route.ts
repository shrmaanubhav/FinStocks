import { NextRequest, NextResponse } from "next/server";

// Popular NASDAQ stocks for autocomplete
// In production, you'd use an official NASDAQ API or data feed
const NASDAQ_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc. Class A" },
  { symbol: "GOOG", name: "Alphabet Inc. Class C" },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "AVGO", name: "Broadcom Inc." },
  { symbol: "COST", name: "Costco Wholesale Corporation" },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "AMD", name: "Advanced Micro Devices Inc." },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "PEP", name: "PepsiCo Inc." },
  { symbol: "CSCO", name: "Cisco Systems Inc." },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "CMCSA", name: "Comcast Corporation" },
  { symbol: "TMUS", name: "T-Mobile US Inc." },
  { symbol: "TXN", name: "Texas Instruments Inc." },
  { symbol: "QCOM", name: "Qualcomm Inc." },
  { symbol: "AMGN", name: "Amgen Inc." },
  { symbol: "INTU", name: "Intuit Inc." },
  { symbol: "HON", name: "Honeywell International Inc." },
  { symbol: "ISRG", name: "Intuitive Surgical Inc." },
  { symbol: "BKNG", name: "Booking Holdings Inc." },
  { symbol: "VRTX", name: "Vertex Pharmaceuticals Inc." },
  { symbol: "ADP", name: "Automatic Data Processing Inc." },
  { symbol: "GILD", name: "Gilead Sciences Inc." },
  { symbol: "MDLZ", name: "Mondelez International Inc." },
  { symbol: "REGN", name: "Regeneron Pharmaceuticals Inc." },
  { symbol: "ADI", name: "Analog Devices Inc." },
  { symbol: "PANW", name: "Palo Alto Networks Inc." },
  { symbol: "LRCX", name: "Lam Research Corporation" },
  { symbol: "SNPS", name: "Synopsys Inc." },
  { symbol: "CDNS", name: "Cadence Design Systems Inc." },
  { symbol: "ASML", name: "ASML Holding NV" },
  { symbol: "KLAC", name: "KLA Corporation" },
  { symbol: "MU", name: "Micron Technology Inc." },
  { symbol: "MRVL", name: "Marvell Technology Inc." },
  { symbol: "PYPL", name: "PayPal Holdings Inc." },
  { symbol: "CRWD", name: "CrowdStrike Holdings Inc." },
  { symbol: "MELI", name: "MercadoLibre Inc." },
  { symbol: "ORLY", name: "O'Reilly Automotive Inc." },
  { symbol: "FTNT", name: "Fortinet Inc." },
  { symbol: "MNST", name: "Monster Beverage Corporation" },
  { symbol: "CTAS", name: "Cintas Corporation" },
  { symbol: "MAR", name: "Marriott International Inc." },
  { symbol: "ABNB", name: "Airbnb Inc." },
  { symbol: "WDAY", name: "Workday Inc." },
  { symbol: "DXCM", name: "DexCom Inc." },
  { symbol: "KDP", name: "Keurig Dr Pepper Inc." },
  { symbol: "ODFL", name: "Old Dominion Freight Line Inc." },
  { symbol: "PCAR", name: "PACCAR Inc." },
  { symbol: "MCHP", name: "Microchip Technology Inc." },
  { symbol: "CEG", name: "Constellation Energy Group" },
  { symbol: "ROST", name: "Ross Stores Inc." },
  { symbol: "EXC", name: "Exelon Corporation" },
  { symbol: "AEP", name: "American Electric Power Co." },
  { symbol: "PAYX", name: "Paychex Inc." },
  { symbol: "FAST", name: "Fastenal Company" },
  { symbol: "CPRT", name: "Copart Inc." },
  { symbol: "KHC", name: "Kraft Heinz Company" },
  { symbol: "EA", name: "Electronic Arts Inc." },
  { symbol: "BKR", name: "Baker Hughes Company" },
  { symbol: "VRSK", name: "Verisk Analytics Inc." },
  { symbol: "CTSH", name: "Cognizant Technology Solutions" },
  { symbol: "XEL", name: "Xcel Energy Inc." },
  { symbol: "GEHC", name: "GE HealthCare Technologies Inc." },
  { symbol: "IDXX", name: "IDEXX Laboratories Inc." },
  { symbol: "ZS", name: "Zscaler Inc." },
  { symbol: "DDOG", name: "Datadog Inc." },
  { symbol: "TEAM", name: "Atlassian Corporation" },
  { symbol: "BIIB", name: "Biogen Inc." },
  { symbol: "ANSS", name: "ANSYS Inc." },
  { symbol: "DLTR", name: "Dollar Tree Inc." },
  { symbol: "ILMN", name: "Illumina Inc." },
  { symbol: "WBD", name: "Warner Bros. Discovery Inc." },
  { symbol: "LCID", name: "Lucid Group Inc." },
  { symbol: "RIVN", name: "Rivian Automotive Inc." },
  { symbol: "COIN", name: "Coinbase Global Inc." },
  { symbol: "ROKU", name: "Roku Inc." },
  { symbol: "SNAP", name: "Snap Inc." },
  { symbol: "DOCU", name: "DocuSign Inc." },
  { symbol: "ZM", name: "Zoom Video Communications" },
  { symbol: "OKTA", name: "Okta Inc." },
  { symbol: "SPLK", name: "Splunk Inc." },
  { symbol: "RBLX", name: "Roblox Corporation" },
  { symbol: "TTWO", name: "Take-Two Interactive Software" },
  { symbol: "LULU", name: "Lululemon Athletica Inc." },
  { symbol: "SBUX", name: "Starbucks Corporation" },
  { symbol: "JD", name: "JD.com Inc." },
  { symbol: "PDD", name: "PDD Holdings Inc." },
  { symbol: "BIDU", name: "Baidu Inc." },
  { symbol: "NTES", name: "NetEase Inc." },
  { symbol: "BILI", name: "Bilibili Inc." },
  { symbol: "WBA", name: "Walgreens Boots Alliance" },
  { symbol: "SIRI", name: "Sirius XM Holdings Inc." },
  { symbol: "CHTR", name: "Charter Communications Inc." },
  { symbol: "EBAY", name: "eBay Inc." },
  { symbol: "ATVI", name: "Activision Blizzard Inc." },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.toLowerCase() || "";

    if (!query || query.length < 1) {
      return NextResponse.json({ stocks: [] });
    }

    // Search by symbol or name
    const matchedStocks = NASDAQ_STOCKS.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 results

    return NextResponse.json({
      stocks: matchedStocks,
      count: matchedStocks.length,
    });
  } catch (error) {
    console.error("Stock search error:", error);
    return NextResponse.json(
      { error: "Failed to search stocks" },
      { status: 500 }
    );
  }
}

// Validate if a symbol is NASDAQ-listed
export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    const stock = NASDAQ_STOCKS.find(
      (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
    );

    if (stock) {
      return NextResponse.json({
        valid: true,
        stock,
      });
    } else {
      return NextResponse.json({
        valid: false,
        message: "Stock not found on NASDAQ",
      });
    }
  } catch (error) {
    console.error("Stock validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate stock" },
      { status: 500 }
    );
  }
}
