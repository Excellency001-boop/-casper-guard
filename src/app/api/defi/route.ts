/**
 * DeFi Intelligence API — powered by CSPR.trade MCP Server
 * Real-time market data, swap quotes, and trade analysis
 * via Model Context Protocol (24 DeFi tools)
 */
import { NextResponse } from 'next/server';
import { getDeFiMarketData, getSwapQuote, analyzeTrade } from '@/lib/mcp-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'market';

  try {
    switch (action) {
      case 'market': {
        const data = await getDeFiMarketData();
        return NextResponse.json({
          agent: 'RiskSentinel',
          source: data.source,
          mcpServer: data.mcpServer,
          protocol: 'Model Context Protocol (MCP)',
          transport: 'Streamable HTTP (SSE)',
          endpoint: 'https://mcp.cspr.trade/mcp',
          toolsAvailable: 24,
          data: {
            tokens: data.tokens,
            pairs: data.pairs,
          },
          timestamp: new Date().toISOString(),
        });
      }

      case 'quote': {
        const tokenIn = url.searchParams.get('tokenIn') || 'CSPR';
        const tokenOut = url.searchParams.get('tokenOut') || 'WCSPR';
        const amount = url.searchParams.get('amount') || '100';

        const quote = await getSwapQuote(tokenIn, tokenOut, amount);
        return NextResponse.json({
          agent: 'RiskSentinel',
          source: quote.source,
          mcpTool: 'get_quote',
          mcpServer: 'cspr-trade v0.4.2',
          quote: quote.quote,
          timestamp: new Date().toISOString(),
        });
      }

      case 'analyze': {
        const tIn = url.searchParams.get('tokenIn') || 'CSPR';
        const tOut = url.searchParams.get('tokenOut') || 'WCSPR';
        const amt = url.searchParams.get('amount') || '1000';

        const analysis = await analyzeTrade(tIn, tOut, amt);
        return NextResponse.json({
          agent: 'RiskSentinel',
          source: analysis.source,
          mcpTool: 'analyze_trade',
          mcpServer: 'cspr-trade v0.4.2',
          analysis: analysis.analysis,
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json({
          error: 'Unknown action',
          availableActions: ['market', 'quote', 'analyze'],
          usage: {
            market: '/api/defi?action=market',
            quote: '/api/defi?action=quote&tokenIn=CSPR&tokenOut=WCSPR&amount=100',
            analyze: '/api/defi?action=analyze&tokenIn=CSPR&tokenOut=WCSPR&amount=1000',
          },
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'DeFi intelligence error', details: String(error) },
      { status: 500 }
    );
  }
}
