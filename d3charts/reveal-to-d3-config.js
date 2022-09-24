var pt = pt || {};

// To avoid using fragments, put everything in the init section.

pt.slideIdToFunctions = {
    'gdp': {
        'init': function() {
            'use strict';
            pt.plotGdpGrowth.init();
            d3.csv("../data/GDP_GROWTH.CSV", pt.plotGdpGrowth.chart);
        }
    },
    'gdp_lr': {
        'init': function() {
            'use strict';
            pt.plotGdpLRun.init();
            d3.csv("../data/GDP_PRODUCTIVITY.CSV", pt.plotGdpLRun.chart);
        }
    },
    'gdp_prod': {
        'init': function() {
            'use strict';
            pt.plotGdpProd.init();
            d3.csv("../data/GDP_PRODUCTIVITY.CSV", pt.plotGdpProd.chart);
        }
    },
    'gdpctr': {
        'init': function() {
            'use strict';
            pt.plotGdpCtr.init();
            d3.csv("../data/GDP_GROWTH.CSV", pt.plotGdpCtr.chart);
        }
    },
    'ism':{
        'init': function() {
            'use strict';
            pt.plotIsm.init();
            d3.csv("../data/ISM_USECON.CSV", pt.plotIsm.chart);
        }
    },
    'labor': {
        'init': function() {
            'use strict';
            pt.plotLaborMkt.init();
            d3.csv("../data/LABOR.CSV", pt.plotLaborMkt.chart);
        }
    },
    'payrolls': {
        'init': function() {
            'use strict';
            pt.plotPayrolls.init();
            d3.csv("../data/LABOR.CSV", pt.plotPayrolls.chart);
        }
    },
    'payrolls_lr': {
        'init': function() {
            'use strict';
            pt.plotPayrollsLRun.init();
            d3.csv("../data/LABOR.CSV", pt.plotPayrollsLRun.chart);
        }
    },
    'laborslack': {
        'init': function() {
            'use strict';
            pt.plotSlack.init();
            d3.csv("../data/LABOR_SLACK.CSV", pt.plotSlack.chart);
        }
    },
    'sbsurvey': {
        'init': function() {
            'use strict';
            pt.plotSbs.init();
            d3.csv("../data/SBS_USECON.CSV", pt.plotSbs.chart);
            // d3.csv("data/SBS_USECON.CSV", pt.plotSbs.update);
        }
    },
    'inf_cpi': {
        'init': function() {
            'use strict';
            pt.plotCpi.init();
            d3.csv("../data/FRED_INFLATION.CSV",pt.plotCpi.chart);
        }
    },
    'inf_pce': {
        'init': function() {
            'use strict';
            pt.plotPce.init();
            d3.csv("../data/FRED_INFLATION.CSV",pt.plotPce.chart);
        }
    },
    'indprod': {
        'init': function() {
            'use strict';
            pt.plotIp.init();
            d3.csv("../data/FRED_IP.CSV",pt.plotIp.chart);
        }
    },
    'sep_pce': {
        'init': function() {
            'use strict';
            pt.plotSepPce.init();
            queue()
                .defer(d3.csv, "../data/FOMC_SEP_ACTUAL.CSV")       // data
                .defer(d3.csv, "../data/FOMC_SEP.CSV")    // Fed projections
                .defer(d3.csv, "../data/FOMC_SEP_LR.CSV") // Fed LR projections
                .await(pt.plotSepPce.chart);
        }
    },
    'sep_ur': {
        'init': function() {
            'use strict';
            pt.plotSepUr.init();
            queue()
                .defer(d3.csv, "../data/FOMC_SEP_ACTUAL.CSV")       // data
                .defer(d3.csv, "../data/FOMC_SEP.CSV")    // Fed projections
                .defer(d3.csv, "../data/FOMC_SEP_LR.CSV") // Fed LR projections
                .await(pt.plotSepUr.chart);
        }
    },
    'sep_gdp': {
        'init': function() {
            'use strict';
            pt.plotSepGdp.init();
            queue()
                .defer(d3.csv, "../data/FOMC_SEP_ACTUAL.CSV")       // data
                .defer(d3.csv, "../data/FOMC_SEP.CSV")    // Fed projections
                .defer(d3.csv, "../data/FOMC_SEP_LR.CSV") // Fed LR projections
                .await(pt.plotSepGdp.chart);
        }
    },
    'dotplot': {
        'init': function() {
            'use strict';
            pt.plotDotPlot.init();
            queue()
                .defer(d3.csv, "../data/sep_latest_date.csv")
                .defer(d3.json,"../data/DOTPLOT.JSON")
                .await(pt.plotDotPlot.chart);
        }
    },
    'fomc_ffr_box': {
        'init': function () {
            'use strict';
            pt.plotFomcFfr.init();
            queue()
                .defer(d3.csv, "../data/sep_latest_date.csv")
                .defer(d3.csv, "../data/SEP_FFR.CSV")
                .await(pt.plotFomcFfr.chart);
        }
    },
    'fomc_gdp_box': {
        'init': function () {
            'use strict';
            pt.plotFomcGdp.init();
            queue()
                .defer(d3.csv, "../data/sep_latest_date.csv")
                .defer(d3.csv, "../data/SEP_GDP.CSV")
                .await(pt.plotFomcGdp.chart);
        }
    },
    'fomc_ur_box': {
        'init': function () {
            'use strict';
            pt.plotFomcUr.init();
            queue()
                .defer(d3.csv, "../data/sep_latest_date.csv")
                .defer(d3.csv, "../data/SEP_UR.CSV")
                .await(pt.plotFomcUr.chart);
        }
    },
    'fomc_pce_box': {
        'init': function () {
            'use strict';
            pt.plotFomcPce.init();
            queue()
                .defer(d3.csv, "../data/sep_latest_date.csv")
                .defer(d3.csv, "../data/SEP_PCE.CSV")
                .await(pt.plotFomcPce.chart);
        }
    },
    'msa_ur': {
        'init': function() {
            pt.plotMsaUr.init();
            d3.csv("../data/MSA_LABOR.CSV",pt.plotMsaUr.chart);
        }
    },
    'msa_ur_sel': {
        'init': function() {
            pt.plotMsaUrSel.init();
            d3.csv("../data/MSA_LABOR.CSV",pt.plotMsaUrSel.chart);
        }
    },
    'msa_emp': {
        'init': function() {
            pt.plotMsaEmp.init();
            d3.csv("../data/MSA_LABOR.CSV",pt.plotMsaEmp.chart);
        }
    },
    'msa_emp_sel': {
        'init': function() {
            pt.plotMsaEmpSel.init();
            d3.csv("../data/MSA_LABOR.CSV",pt.plotMsaEmpSel.chart);
        }
    },
    'map_ur_curr': {
        'init': function() {
            pt.plotMapUrCurr.init();
            queue()
                .defer(d3.csv,  "../data/urmap_latest_date.csv")
                .defer(d3.json, "../data/us.json")
                .defer(d3.tsv, "../data/urd4_prev_curr.tsv")
                .await(pt.plotMapUrCurr.chart);
        }
    },
    'map_ur_diff': {
        'init': function() {
            pt.plotMapUrDiff.init();
            queue()
                .defer(d3.csv,  "../data/urmap_latest_date.csv")
                .defer(d3.json, "../data/us.json")
                .defer(d3.tsv, "../data/urd4_prev_curr.tsv")
                .await(pt.plotMapUrDiff.chart);
        }
    },
    'frbal_assets': {
        'init': function() {
            'use strict';
            pt.plotFRBalAssets.init();
            d3.csv("../data/FR_BAL_SEL_ASSETS.CSV",pt.plotFRBalAssets.chart);
        }
    },
    'frbal_liabs': {
        'init': function() {
            'use strict';
            pt.plotFRBalLiabs.init();
            d3.csv("../data/FR_BAL_SEL_LIABS.CSV",pt.plotFRBalLiabs.chart);
        }
    },
    'bitcoin_price': {
        'init': function() {
            'use strict';
            pt.plotBitPrice.init();
            d3.csv("../data/BITCOINRETURNS.CSV",pt.plotBitPrice.chart);
        }
    },
    'bitcoin_returns': {
        'init': function() {
            'use strict';
            pt.plotBitRet.init();
            d3.csv("../data/BITCOINRETURNS.CSV",pt.plotBitRet.chart);
        }
    },
    'gold_price': {
        'init': function() {
            'use strict';
            pt.plotGoldPrice.init();
            d3.csv("../data/GOLDRETURNS.CSV",pt.plotGoldPrice.chart);
        }
    },
    'gold_returns': {
        'init': function() {
            'use strict';
            pt.plotGoldRet.init();
            d3.csv("../data/GOLDRETURNS.CSV",pt.plotGoldRet.chart);
        }
    },
    'bitcoin_gtrends': {
        'init': function() {
            'use strict';
            pt.plotBitGTrends.init();
            d3.csv("../data/googleTrendsBitcoin.csv",pt.plotBitGTrends.chart);
        }
    },
    'bitcoin_map': {
        'init': function() {
            pt.plotMapBitcoinGoogleTrends.init();
            queue()
                .defer(d3.json, "../data/world_countries.json")
                .defer(d3.csv, "../data/geoMapBitcoinISO.csv")
                .await(pt.plotMapBitcoinGoogleTrends.chart);
        }
    },
    'frb_timeline': {
        'init': function() {
            pt.plotFrbTimeline.init();
            queue()
                .defer(d3.csv, "../data/fedfunds.csv")
                .defer(d3.csv, "../data/FR_BAL_SEL_ASSETS.CSV")
                .defer(d3.csv, "../data/timelineEvents.CSV")
                .await(pt.plotFrbTimeline.chart);
        }
    },
    'crepi_topics': {
        'init': function() {
            pt.plotCrePiTopics.init();
            d3.csv("../data/CRE_PRICES.CSV",pt.plotCrePiTopics.chart);
        }
    },
    'crepi_region': {
        'init': function() {
            pt.plotCrePiRegion.init();
            d3.csv("../data/CRE_PRICES.CSV",pt.plotCrePiRegion.chart);
        }
    },
    'wage_growth': {
        'init': function() {
            'use strict';
            pt.plotWageGrowth.init();
            d3.csv("../data/WAGES.CSV",pt.plotWageGrowth.chart);
        }
    },
    'wage_bbsent': {
        'init': function() {
            'use strict';
            pt.plotWgtBbSent.init();
            d3.tsv("../data/bbwgsent.tsv",pt.plotWgtBbSent.chart);
        }
    },
        'confidence': {
        'init': function() {
            'use strict';
            pt.plotConfidence.init();
            d3.csv("../data/CONFIDENCE.CSV",pt.plotConfidence.chart);
        }
    },
}
