/* Estimation & Costing — Unit Content Data (Units 5-7) */
const EST_UNITS_B = [
    {
        id: 5, icon: "⚡", title: "Substation & Earthing", color: "#a78bfa", cards: [
            {
                id: "c5-1", title: "5.1 — Pole Mounted Substation", formulas: [
                    { label: "Transformer Sizing", tex: "kVA \\geq \\frac{MD}{\\cos\\phi}" },
                    { label: "Standard Ratings", tex: "25, 63, 100, 160, 250, 315, 400, 500, 630 \\text{ kVA}" },
                    { label: "Optimal Loading", tex: "kVA_{sel} = \\frac{MD}{0.75 \\times \\cos\\phi}" },
                    { label: "HV Current (11kV)", tex: "I_{HV} = \\frac{kVA \\times 1000}{\\sqrt{3} \\times 11000}" },
                    { label: "HV Fuse", tex: "I_{fuse} = 1.5\\text{-}2.5 \\times I_{HV(FL)}" },
                    { label: "LV Current (415V)", tex: "I_{LV} = \\frac{kVA \\times 1000}{\\sqrt{3} \\times 415}" },
                    { label: "LV ACB", tex: "I_{ACB} \\geq 1.25 \\times I_{LV(FL)}" }
                ],
                boq: {
                    title: "Pole Mounted Substation BOQ", cols: ["S.No", "Description", "Unit", "Qty"], rows: [
                        ["1", "11/0.415kV Transformer", "Nos", "1"], ["2", "11m steel pole (DP)", "Nos", "2"],
                        ["3", "11kV Gang isolator", "Nos", "1"], ["4", "11kV Drop-out fuse", "Sets", "1"],
                        ["5", "11kV Lightning arrester", "Sets", "2"], ["6", "415V ACB/MCCB", "Nos", "1"],
                        ["7", "LT MCCBs", "Sets", "4"], ["8", "LT Distribution panel", "Nos", "1"],
                        ["9", "AB switch (415V)", "Nos", "1"], ["10", "ACSR conductor jumpers", "m", "20"],
                        ["11", "LT armoured cable", "m", "50"], ["12", "Earth electrode (pipe, 3m)", "Nos", "3"],
                        ["13", "Earth GI wire", "m", "30"], ["14", "Transformer platform", "Sets", "1"],
                        ["15", "Safety fence", "m", "40"]]
                },
                calculator: "transformerSizer"
            },
            {
                id: "c5-2", title: "5.2 — Earthing System Design", formulas: [
                    { label: "Pipe Earth Resistance", tex: "R_{pipe} = \\frac{\\rho}{2\\pi L} \\ln\\left(\\frac{4L}{d}\\right)" },
                    { label: "Plate Earth Resistance", tex: "R_{plate} = \\frac{\\rho}{4r}, \\quad r = \\sqrt{\\frac{A}{\\pi}}" },
                    { label: "Parallel Electrodes", tex: "R_{n} = \\frac{R_{single}}{n} \\quad (\\text{spacing} > 2L)" },
                    { label: "No. of Electrodes", tex: "n = \\lceil R_{single} / R_{required} \\rceil" },
                    { label: "ECC Size", tex: "A_{ECC} = \\frac{A_{phase}}{2}, \\quad \\min 6\\text{mm}^2" },
                    { label: "Chemical Treatment", tex: "R_{treated} = R_{untreated} \\times 0.2\\text{-}0.4" }
                ], where: ["$\\rho$ = Soil resistivity (Ω·m)", "$L$ = Length of pipe (m)", "$d$ = Diameter of pipe (m)"],
                notes: ["Generating stations: R ≤ 1Ω", "Major substations: R ≤ 2Ω", "Distribution SS: R ≤ 5Ω", "Consumer premises: R ≤ 8Ω",
                    "Wet clay: 2–10 Ω·m", "Agricultural: 10–100 Ω·m", "Sandy: 100–1000 Ω·m", "Dry rock: 1000–10000 Ω·m"],
                boq: {
                    title: "Earthing BOQ (per electrode)", cols: ["S.No", "Description", "Unit", "Qty"], rows: [
                        ["1", "GI pipe 50mm×3m", "Nos", "1"], ["2", "GI clamp", "Nos", "1"],
                        ["3", "GI earth strip 25×3mm", "m", "10"], ["4", "Charcoal", "kg", "10"],
                        ["5", "Rock salt (NaCl)", "kg", "10"], ["6", "Masonry chamber", "Nos", "1"],
                        ["7", "CI cover 300×300mm", "Nos", "1"], ["8", "Excavation", "m³", "0.3"],
                        ["9", "Backfilling", "m³", "0.3"]]
                },
                calculator: "earthCalc"
            },
            {
                id: "c5-3", title: "5.3 — IE Rules & Safety", formulas: [
                    { label: "LV Clearance", tex: "5.8\\text{m}" },
                    { label: "11kV Clearance", tex: "6.1\\text{m}" },
                    { label: "66kV Clearance", tex: "6.1 + 0.3\\text{m per 33kV}" },
                    { label: "132kV Clearance", tex: "7.0\\text{m}" },
                    { label: "220kV Clearance", tex: "8.0\\text{m}" },
                    { label: "400kV Clearance", tex: "8.84\\text{m}" },
                    { label: "Safety 11kV", tex: "0.9\\text{m approach}" },
                    { label: "Safety 33kV", tex: "1.2\\text{m approach}" },
                    { label: "Safety 132kV", tex: "2.0\\text{m approach}" }
                ]
            }
        ]
    },
    {
        id: 6, icon: "🔧", title: "Repair & Maintenance Estimation", color: "#fb7185", cards: [
            {
                id: "c6-1", title: "6.1 — Maintenance Cost Estimation", formulas: [
                    { label: "Annual Maintenance", tex: "C_{maint} = \\%_{maint} \\times C_{asset}" },
                    { label: "OEE", tex: "OEE = A \\times P \\times Q" },
                    { label: "Availability", tex: "A = \\frac{T_{operating}}{T_{available}}" },
                    { label: "Life Cycle Cost", tex: "LCC = C_{purchase} + C_{install} + C_{oper} + C_{maint} - C_{salvage}" },
                    { label: "Depreciation", tex: "D = \\frac{C_{purchase} - C_{salvage}}{L_{life}}" },
                    { label: "Annual Equivalent", tex: "AEC = D + C_{maint} + C_{operating}" },
                    { label: "Insulation Life", tex: "T = T_{base} \\times 2^{(T_{rated}-T_{actual})/10}" }
                ], notes: ["Electrical installations: 1–2% asset/yr", "Rotating machines: 2–4%", "Electronics: 3–5%",
                    "Bearing replacement: every 8000–10000 hrs", "Insulation: A=105°C, B=130°C, F=155°C, H=180°C"]
            },
            {
                id: "c6-2", title: "6.2 — Machine Maintenance BOQ",
                boq: {
                    title: "Transformer Maintenance (Annual)", cols: ["S.No", "Description", "Unit", "Qty"], rows: [
                        ["1", "Oil testing (BDV, moisture)", "Test", "4"], ["2", "Oil filtration", "Lot", "1"],
                        ["3", "Oil replacement", "Litre", "Vol"], ["4", "Silica gel replacement", "kg", "5"],
                        ["5", "Bushing cleaning", "Set", "2"], ["6", "Fan/radiator inspection", "Lot", "1"],
                        ["7", "Earth resistance test", "Test", "4"], ["8", "IR test (megger)", "Test", "2"],
                        ["9", "Gasket replacement", "Set", "1"], ["10", "OLTC inspection", "Lot", "1"]]
                },
                maintTable: {
                    cols: ["Equipment", "Daily", "Monthly", "Annual"], rows: [
                        ["Transformer (dry)", "Temp/Load", "IR test", "Full PM"],
                        ["Transformer (oil)", "Oil level", "BDV test", "Oil change"],
                        ["Induction motor", "Vibration", "Cleaning", "Bearing"],
                        ["DC motor", "Brush check", "Commutator", "Rewind"],
                        ["Switchgear (MV)", "Alarms", "Contact check", "Trip test"],
                        ["UPS/Battery", "Charge level", "Capacity test", "Replace"]]
                }
            }
        ]
    },
    {
        id: 7, icon: "🧮", title: "Complete Estimation Problems", color: "#60a5fa", cards: [
            {
                id: "c7-1", title: "7.1 — 3-Bedroom House Wiring", type: "problem",
                given: "3 Bedrooms (2L+2F+2×5A+1×15A each), 1 Hall (4L+2F+4×5A), 1 Kitchen (2L+1F+2×5A+1×15A geyser 3kW)",
                steps: [
                    { label: "Step 1 — Connected Load", tex: "P_{bed} = 3(120+120+200+1500) = 5820\\text{W}", extra: "$P_{hall}=960\\text{W}, P_{kit}=3320\\text{W}$" },
                    { label: "Step 2 — TCL", tex: "TCL = 5820+960+3320 = 10100\\text{W} \\approx 10\\text{kW}" },
                    { label: "Step 3 — Max Demand", tex: "MD = 10000 \\times 0.6 = 6000\\text{W} = 6\\text{kW}" },
                    { label: "Step 4 — Service Current", tex: "I = \\frac{6000}{230 \\times 0.85} = 30.7\\text{A}" },
                    { label: "Step 5 — Cable Selection", tex: "\\text{Select: 10mm}^2 \\text{ 2C Al (rated 40A)}" },
                    { label: "Step 6 — Voltage Drop", tex: "\\Delta V = \\frac{2 \\times 2.82 \\times 10^{-8} \\times 15 \\times 30.7}{10 \\times 10^{-6}} = 2.6\\text{V}" },
                    { label: "Step 7 — Check", tex: "\\%VD = \\frac{2.6}{230} \\times 100 = 1.1\\% \\leq 5\\% \\; \\checkmark" }
                ]
            },
            {
                id: "c7-2", title: "7.2 — 100kVA Substation Estimation", type: "problem",
                given: "Maximum Demand = 75kW, PF = 0.85, Soil resistivity ρ = 50 Ω·m",
                steps: [
                    { label: "Step 1 — kVA Required", tex: "kVA = \\frac{75}{0.85} = 88.2 \\rightarrow \\text{Select 100kVA}" },
                    { label: "Step 2 — HV Current", tex: "I_{HV} = \\frac{100000}{\\sqrt{3} \\times 11000} = 5.25\\text{A}" },
                    { label: "Step 3 — HV Fuse", tex: "I_{fuse} = 2 \\times 5.25 = 10.5\\text{A} \\rightarrow 16\\text{A}" },
                    { label: "Step 4 — LV Current", tex: "I_{LV} = \\frac{100000}{\\sqrt{3} \\times 415} = 139\\text{A}" },
                    { label: "Step 5 — LV MCCB", tex: "I_{MCCB} = 1.25 \\times 139 = 174\\text{A} \\rightarrow 200\\text{A}" },
                    { label: "Step 6 — Earth R", tex: "R = \\frac{50}{2\\pi \\times 3}\\ln\\left(\\frac{12}{0.05}\\right) = 14.5\\Omega" },
                    { label: "Step 7 — Electrodes", tex: "n = \\lceil 14.5/5 \\rceil = 3 \\text{ pipes (use 4 at 2m spacing)}" }
                ]
            }
        ]
    }
];
