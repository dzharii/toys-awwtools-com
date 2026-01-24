<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:strip-space elements="*"/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Cyber Defense Algorithm Catalog</title>
        <style type="text/css">
          :root {
            --bg: #0b1220;
            --panel: rgba(255, 255, 255, 0.06);
            --panel2: rgba(255, 255, 255, 0.04);
            --text: rgba(255, 255, 255, 0.92);
            --muted: rgba(255, 255, 255, 0.68);
            --faint: rgba(255, 255, 255, 0.52);
            --border: rgba(255, 255, 255, 0.12);

            --accent: #7c3aed;
            --accent2: #22c55e;
            --warn: #f59e0b;

            --chipBg: rgba(124, 58, 237, 0.16);
            --chipBorder: rgba(124, 58, 237, 0.38);

            --shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
            --shadow2: 0 6px 18px rgba(0, 0, 0, 0.28);

            --radius: 16px;
            --radius2: 12px;
            --pad: 18px;

            --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            --sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
          }

          * { box-sizing: border-box; }

          html, body {
            margin: 0;
            padding: 0;
            background: radial-gradient(1200px 900px at 20% 10%, rgba(124, 58, 237, 0.25), transparent 55%),
                        radial-gradient(900px 650px at 80% 20%, rgba(34, 197, 94, 0.12), transparent 60%),
                        radial-gradient(1200px 900px at 60% 90%, rgba(245, 158, 11, 0.10), transparent 55%),
                        var(--bg);
            color: var(--text);
            font-family: var(--sans);
            line-height: 1.55;
          }

          a { color: inherit; text-decoration: none; }

          .wrap {
            max-width: 1180px;
            margin: 0 auto;
            padding: 28px 20px 56px 20px;
          }

          .topbar {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            padding: 22px;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03));
            box-shadow: var(--shadow);
            backdrop-filter: blur(10px);
          }

          .title {
            margin: 0;
            font-size: 26px;
            letter-spacing: -0.02em;
            font-weight: 700;
          }

          .subtitle {
            margin: 8px 0 0 0;
            color: var(--muted);
            font-size: 14px;
            max-width: 70ch;
          }

          .metaRow {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: flex-end;
            align-items: center;
          }

          .pill {
            display: inline-flex;
            gap: 8px;
            align-items: center;
            padding: 8px 10px;
            border-radius: 999px;
            background: var(--panel);
            border: 1px solid var(--border);
            color: var(--muted);
            font-size: 12px;
            box-shadow: var(--shadow2);
          }

          .pill b { color: var(--text); font-weight: 650; }

          .grid {
            margin-top: 18px;
            display: grid;
            grid-template-columns: 340px 1fr;
            gap: 16px;
          }

          @media (max-width: 980px) {
            .grid { grid-template-columns: 1fr; }
          }

          .sidebar {
            border: 1px solid var(--border);
            border-radius: var(--radius);
            background: var(--panel2);
            box-shadow: var(--shadow2);
            overflow: hidden;
          }

          .sideHeader {
            padding: 16px;
            border-bottom: 1px solid var(--border);
            background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
          }

          .sideHeader h2 {
            margin: 0;
            font-size: 14px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--muted);
          }

          .searchHint {
            margin: 10px 0 0 0;
            font-size: 13px;
            color: var(--faint);
          }

          .schema {
            padding: 14px 16px 18px 16px;
          }

          .schemaTable {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          .schemaTable th, .schemaTable td {
            padding: 10px 8px;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
          }

          .schemaTable th {
            color: var(--muted);
            font-weight: 650;
            text-align: left;
            width: 38%;
          }

          .schemaName {
            font-family: var(--mono);
            font-size: 12px;
            color: rgba(255,255,255,0.86);
          }

          .schemaType {
            color: var(--faint);
            font-family: var(--mono);
            margin-top: 4px;
          }

          .content {
            border: 1px solid var(--border);
            border-radius: var(--radius);
            background: var(--panel2);
            box-shadow: var(--shadow2);
            overflow: hidden;
          }

          .contentHeader {
            padding: 16px;
            border-bottom: 1px solid var(--border);
            display: flex;
            gap: 12px;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
          }

          .contentHeader h2 {
            margin: 0;
            font-size: 14px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--muted);
          }

          .legend {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
            color: var(--faint);
            font-size: 12px;
          }

          .chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 999px;
            background: var(--chipBg);
            border: 1px solid var(--chipBorder);
            color: rgba(255,255,255,0.88);
            font-size: 12px;
            font-family: var(--mono);
          }

          .chip .dot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: var(--accent);
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18);
          }

          .cards {
            padding: 16px;
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .card {
            border: 1px solid var(--border);
            border-radius: var(--radius2);
            background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
            padding: 16px;
            box-shadow: var(--shadow2);
          }

          .cardTop {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            justify-content: space-between;
            flex-wrap: wrap;
          }

          .rank {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            height: 34px;
            padding: 0 10px;
            border-radius: 999px;
            border: 1px solid var(--border);
            background: rgba(0,0,0,0.18);
            color: rgba(255,255,255,0.92);
            font-family: var(--mono);
            font-size: 13px;
          }

          .name {
            margin: 0;
            font-size: 18px;
            letter-spacing: -0.01em;
            font-weight: 750;
          }

          .category {
            margin: 6px 0 0 0;
            color: var(--muted);
            font-size: 13px;
            max-width: 90ch;
          }

          .badges {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border-radius: 999px;
            border: 1px solid var(--border);
            background: rgba(255,255,255,0.04);
            color: var(--muted);
            font-size: 12px;
          }

          .badge b { color: var(--text); font-weight: 650; }

          .badgeDifficultyLow b { color: #a7f3d0; }
          .badgeDifficultyMedium b { color: #fde68a; }
          .badgeDifficultyHigh b { color: #fecaca; }

          .detailsGrid {
            margin-top: 14px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          @media (max-width: 760px) {
            .detailsGrid { grid-template-columns: 1fr; }
          }

          .field {
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 12px;
            background: rgba(255,255,255,0.03);
          }

          .field h4 {
            margin: 0 0 8px 0;
            font-size: 12px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--faint);
            font-weight: 650;
          }

          .field p {
            margin: 0;
            font-size: 13px;
            color: rgba(255,255,255,0.88);
          }

          .mono {
            font-family: var(--mono);
            font-size: 12px;
            color: rgba(255,255,255,0.82);
            white-space: pre-wrap;
            word-break: break-word;
          }

          .footer {
            margin-top: 14px;
            color: var(--faint);
            font-size: 12px;
          }

          .kvs {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .kv {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 10px;
            align-items: start;
          }

          @media (max-width: 520px) {
            .kv { grid-template-columns: 1fr; }
          }

          .kv .k {
            color: var(--faint);
            text-transform: uppercase;
            letter-spacing: 0.04em;
            font-size: 11px;
            font-weight: 650;
          }

          .kv .v {
            color: rgba(255,255,255,0.88);
            font-size: 13px;
          }
        </style>
      </head>

      <body>
        <div class="wrap">

          <div class="topbar">
            <div>
              <h1 class="title">Cyber Defense Algorithm Catalog</h1>
              <p class="subtitle">
                Reader-friendly view generated from the XML. Algorithms are displayed as ranked cards with practical fields like usage, inputs/outputs, and operational notes.
              </p>
            </div>

            <div class="metaRow">
              <div class="pill">
                <b>Schema</b>
                <span>
                  <xsl:value-of select="/CyberDefenseAlgorithmCatalog/@schemaVersion"/>
                </span>
              </div>
              <div class="pill">
                <b>Algorithms</b>
                <span>
                  <xsl:value-of select="count(/CyberDefenseAlgorithmCatalog/Algorithms/Algorithm)"/>
                </span>
              </div>
              <div class="pill">
                <b>Sorted</b>
                <span>by rank</span>
              </div>
            </div>
          </div>

          <div class="grid">

            <div class="sidebar">
              <div class="sideHeader">
                <h2>Fields</h2>
                <p class="searchHint">This shows the schema embedded in the XML, so readers know what each field means.</p>
              </div>

              <div class="schema">
                <table class="schemaTable">
                  <xsl:for-each select="/CyberDefenseAlgorithmCatalog/Schema/Field">
                    <tr>
                      <th>
                        <div class="schemaName">
                          <xsl:value-of select="@name"/>
                        </div>
                        <div class="schemaType">
                          <xsl:value-of select="@type"/>
                        </div>
                      </th>
                      <td>
                        <xsl:value-of select="@description"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </table>

                <div class="footer">
                  Tip: Add more &lt;Field&gt; entries in the XML schema and they will appear here automatically.
                </div>
              </div>
            </div>

            <div class="content">
              <div class="contentHeader">
                <h2>Ranked algorithms</h2>
                <div class="legend">
                  <span class="chip"><span class="dot"></span> ranked cards</span>
                  <span class="chip"><span class="dot"></span> practical notes</span>
                </div>
              </div>

              <div class="cards">
                <xsl:for-each select="/CyberDefenseAlgorithmCatalog/Algorithms/Algorithm">
                  <xsl:sort select="@rank" data-type="number" order="ascending"/>

                  <div class="card">
                    <div class="cardTop">
                      <div>
                        <div class="rank">#<xsl:value-of select="@rank"/></div>
                      </div>

                      <div style="flex: 1 1 520px; min-width: 280px;">
                        <h3 class="name">
                          <xsl:value-of select="name"/>
                        </h3>
                        <div class="category">
                          <span style="opacity: 0.9;">Category:</span>
                          <span style="color: rgba(255,255,255,0.86);"><xsl:value-of select="@category"/></span>
                        </div>
                      </div>

                      <div class="badges">
                        <div class="badge">
                          <b>Family</b>
                          <span><xsl:value-of select="family"/></span>
                        </div>

                        <xsl:variable name="diff" select="difficulty"/>
                        <xsl:choose>
                          <xsl:when test="$diff='Low'">
                            <div class="badge badgeDifficultyLow">
                              <b>Difficulty</b>
                              <span><xsl:value-of select="$diff"/></span>
                            </div>
                          </xsl:when>
                          <xsl:when test="$diff='Medium'">
                            <div class="badge badgeDifficultyMedium">
                              <b>Difficulty</b>
                              <span><xsl:value-of select="$diff"/></span>
                            </div>
                          </xsl:when>
                          <xsl:otherwise>
                            <div class="badge badgeDifficultyHigh">
                              <b>Difficulty</b>
                              <span><xsl:value-of select="$diff"/></span>
                            </div>
                          </xsl:otherwise>
                        </xsl:choose>
                      </div>
                    </div>

                    <div class="detailsGrid">
                      <div class="field">
                        <h4>What it does</h4>
                        <p><xsl:value-of select="whatItDoes"/></p>
                      </div>

                      <div class="field">
                        <h4>How it works</h4>
                        <p><xsl:value-of select="howItWorks"/></p>
                      </div>

                      <div class="field">
                        <h4>Where applied</h4>
                        <p><xsl:value-of select="whereApplied"/></p>
                      </div>

                      <div class="field">
                        <h4>Inputs and outputs</h4>
                        <p><xsl:value-of select="inputsOutputs"/></p>
                      </div>

                      <div class="field">
                        <h4>Common usage</h4>
                        <p><xsl:value-of select="commonUsage"/></p>
                      </div>

                      <div class="field">
                        <h4>Alternatives</h4>
                        <p><xsl:value-of select="alternatives"/></p>
                      </div>

                      <div class="field" style="grid-column: 1 / -1;">
                        <h4>Notes</h4>
                        <p><xsl:value-of select="notes"/></p>
                      </div>
                    </div>

                    <div class="footer">
                      <div class="kvs">
                        <div class="kv">
                          <div class="k">Rank</div>
                          <div class="v mono"><xsl:value-of select="@rank"/></div>
                        </div>
                        <div class="kv">
                          <div class="k">Category</div>
                          <div class="v"><xsl:value-of select="@category"/></div>
                        </div>
                      </div>
                    </div>

                  </div>
                </xsl:for-each>
              </div>
            </div>

          </div>
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
