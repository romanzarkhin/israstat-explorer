The Housing Market Index is functionally distinct from the standard Consumer Price Index (CPI). While most indices follow a predictable monthly cycle, housing data requires specialized handling to ensure statistical accuracy in development and analysis.
1. The Bi-Monthly Publication Cycle
Unlike the majority of CBS indices that update monthly, the Housing Market Index is published bi-monthly.
• Agent Impact: Your IDE agent must be programmed to expect new data points only every two months for Chapter aa, whereas it should look for monthly updates for Chapter a (General CPI).
2. Temporal Lag Discrepancies
The "age" of the data in the Housing Market Index differs from other economic indicators:
• Housing Market Index: Reflects transactions that occurred 2–3 months ago.
• Standard Indices: Typically reflect market conditions from 3–4 months ago.
• Integration Note: When bridging these datasets in an IDE, the agent must account for this one-month offset to avoid misaligning real estate trends with general inflation.
3. The "Provisional Data" Window
The most critical logic for developers involves the provisional status of recent entries. The CBS API considers the last 3 indices in a housing series to be provisional.
• Reasoning: Real estate transaction reports often arrive at the CBS with a delay. As new reports are processed, the figures for the three most recent periods are frequently updated and revised.
• Development Constraint: AI agents should be instructed to treat the most recent three data points as "volatile" and subject to change.
4. Linkage and Calculation Warnings
The MCP server architecture includes built-in Housing Market Warnings specifically for these provisional periods.
• The Linkage Rule: It is strongly recommended against using provisional periods for formal linkage calculations (e.g., adjusting contract values based on the index).
• Implementation: When using the get_index_calculator tool for housing codes, the bridge should trigger a notification if the toDate falls within the 3-month provisional window.
5. Technical Identification
To isolate housing-specific data in your API queries, use the following identifiers:
• Chapter Code: aa (Housing Market Index).
• Related Chapters (Construction Inputs): Do not confuse the Housing Market Index with Chapter c (Residential Building Input) or Chapter ca (Commercial Building Input), which track material costs rather than property transaction prices.
• Specific Tools: Use get_chapter_topics with chapterId: "aa" to discover specific sub-indices like "Average Prices of Dwellings" or "Average Monthly Rent".
Summary of Differences
[
  {
    "feature": "Frequency",
    "standard_indices_cpi": "Monthly",
    "housing_market_index_aa": "Bi-monthly",
    "source_reference": "MCP README Section 54"
  },
  {
    "feature": "Temporal Lag",
    "standard_indices_cpi": "3–4 months",
    "housing_market_index_aa": "2–3 months",
    "source_reference": "MCP README Section 54"
  },
  {
    "feature": "Stability",
    "standard_indices_cpi": "Generally Final",
    "housing_market_index_aa": "Last 3 entries are provisional",
    "source_reference": "MCP README Section 54"
  },
  {
    "feature": "Usage Recommendation",
    "standard_indices_cpi": "Safe for immediate linkage",
    "housing_market_index_aa": "Avoid linkage for provisional periods",
    "source_reference": "MCP README Section 50, 54"
  }
]
