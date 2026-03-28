/* Estimation & Costing — Unit Content Data (Units 1-4) */
const EST_UNITS_A = [
    {
        id: 1, icon: "💰", title: "Principles of Estimation & Costing", color: "#facc15", cards: [
            {
                id: "c1-1", title: "1.1 — Definitions & Basic Concepts", type: "glossary", items: [
                    { term: "ESTIMATE", def: "Approximate calculation of cost before actual execution" },
                    { term: "COST", def: "Total Cost = Material + Labor + Overhead + Profit" },
                    { term: "TENDER", def: "Detailed cost offer submitted by contractor" },
                    { term: "BOQ", def: "Bill of Quantities = Σ(Item × Quantity × Unit Rate)" }
                ]
            },
            {
                id: "c1-2", title: "1.2 — Cost Components & Formulas", formulas: [
                    { label: "Material Cost", tex: "C_{material} = \\sum_{i=1}^{n} Q_i \\times R_i" },
                    { label: "Labor Cost", tex: "C_{labor} = \\sum_{j=1}^{m} H_j \\times W_j" },
                    { label: "Overhead", tex: "C_{overhead} = \\%_{overhead} \\times C_{direct}", note: "Typical: 10–15%" },
                    { label: "Contingency", tex: "C_{contingency} = \\%_{cont} \\times (C_{mat} + C_{lab} + C_{OH})", note: "Typical: 5–10%" },
                    { label: "Profit", tex: "C_{profit} = \\%_{profit} \\times (C_{direct} + C_{OH} + C_{cont})", note: "Typical: 10–15%" },
                    { label: "Total Estimated Cost", tex: "C_{total} = C_{mat} + C_{lab} + C_{OH} + C_{cont} + C_{profit}" },
                    { label: "Percentage Form", tex: "C_{total} = C_{direct} \\times (1+\\%_{OH})(1+\\%_{cont})(1+\\%_{profit})" },
                    { label: "Tender Price", tex: "\\text{Tender} = C_{total} \\times 1.18 \\quad (\\text{GST 18\\%})" },
                    { label: "Escalation", tex: "\\text{Escalation} = \\frac{P_2 - P_1}{P_1} \\times 100\\%" }
                ], where: ["$Q_i$ = Quantity of material $i$", "$R_i$ = Rate per unit of material $i$", "$H_j$ = Hours of labor $j$", "$W_j$ = Wage rate of labor $j$"],
                calculator: "costBuilder"
            },
            {
                id: "c1-3", title: "1.3 — Market Survey & Rate Analysis", formulas: [
                    { label: "Schedule of Rates", tex: "R_{analyzed} = R_{mat} + R_{lab} + R_{mach} + \\text{OH\\%} + \\text{profit\\%}" },
                    { label: "Unit Rate", tex: "\\text{Rate/unit} = \\frac{\\text{Total cost of one unit work}}{\\text{Number of units}}" },
                    { label: "Wastage Factor", tex: "Q_{order} = Q_{required} \\times (1 + \\text{wastage\\%})" },
                    { label: "NPV", tex: "NPV = \\sum_{t=0}^{n} \\frac{C_t}{(1+r)^t}" },
                    { label: "Annual Cost", tex: "A = P \\cdot \\frac{r(1+r)^n}{(1+r)^n - 1}" },
                    { label: "Payback Period", tex: "PBP = \\frac{\\text{Initial Investment}}{\\text{Annual Savings}}" },
                    { label: "ROI", tex: "ROI = \\frac{\\text{Net Profit}}{\\text{Total Investment}} \\times 100\\%" }
                ], notes: ["Wires/Cables wastage: 5–10%", "Conduits: 5%", "Accessories: 2–3%"]
            },
            {
                id: "c1-4", title: "1.4 — Tender Document Preparation", checklist: ["Notice Inviting Tender (NIT)", "Instructions to Bidders", "General Conditions of Contract (GCC)", "Special Conditions of Contract (SCC)", "Technical Specifications", "Bill of Quantities (BOQ)", "Drawings and Designs", "Schedule of Rates", "Form of Tender"],
                formulas: [
                    { label: "EMD", tex: "EMD = 2\\text{-}3\\% \\text{ of Tender Value}" },
                    { label: "Security Deposit", tex: "SD = 5\\text{-}10\\% \\text{ of Contract Value}" },
                    { label: "Retention Money", tex: "\\text{Retention} = 10\\% \\text{ of each bill}" },
                    { label: "Liquidated Damages", tex: "LD = 0.5\\% \\text{ per week}, \\; LD_{max} = 10\\%" }
                ]
            }
        ]
    },
    {
        id: 2, icon: "🏠", title: "Domestic & Residential Wiring", color: "#00f5ff", cards: [
            {
                id: "c2-1", title: "2.1 — Service Connection Estimation", formulas: [
                    { label: "1-Phase Load Current", tex: "I_{FL} = \\frac{P_{total}}{V \\times \\cos\\phi} = \\frac{P}{230 \\times 0.85}" },
                    { label: "Design Current", tex: "I_{design} = I_{FL} \\times DF \\quad (DF = 0.5\\text{-}0.8)" },
                    { label: "Voltage Drop (1-ph)", tex: "\\Delta V = \\frac{2\\rho L I}{A} \\leq 5\\% \\times 230 = 11.5\\text{V}" },
                    { label: "Cable CSA", tex: "A_{min} = \\frac{2\\rho L I}{\\Delta V_{allowed}}" },
                    { label: "3-Phase Current", tex: "I_{line} = \\frac{P}{\\sqrt{3} \\times 415 \\times \\cos\\phi}" },
                    { label: "3-Phase VD", tex: "\\Delta V = \\frac{\\sqrt{3}\\rho L I}{A} \\leq 5\\% \\times 415" }
                ], where: ["$\\rho$ = Resistivity (Cu: $1.72\\times10^{-8}$, Al: $2.82\\times10^{-8}$ Ω·m)", "$L$ = One-way cable length (m)", "$A$ = Cross-section area (m²)"],
                boq: {
                    title: "Service Connection Materials", cols: ["Load (kW)", "1-ph Wire", "3-ph Wire"], rows: [
                        ["Up to 5", "2C × 6mm² Al", "4C × 6mm² Al"], ["5–10", "2C × 10mm² Al", "4C × 10mm² Al"],
                        ["10–20", "2C × 16mm² Al", "4C × 16mm² Al"], ["20–40", "2C × 25mm² Al", "4C × 25mm² Al"],
                        ["40–60", "2C × 35mm² Al", "4C × 35mm² Al"]]
                },
                calculator: "cableSizer"
            },
            {
                id: "c2-2", title: "2.2 — House Wiring Estimation", formulas: [
                    { label: "Light point", tex: "60\\text{W per point}" },
                    { label: "Fan point", tex: "60\\text{W per point}" },
                    { label: "5A Socket", tex: "100\\text{W per point}" },
                    { label: "15A Socket", tex: "1000\\text{W per point}" },
                    { label: "AC 1.5T", tex: "1500\\text{W per unit}" },
                    { label: "Total Connected Load", tex: "TCL = \\sum(\\text{Points} \\times \\text{Wattage})" },
                    { label: "Maximum Demand", tex: "MD = TCL \\times DF" },
                    { label: "No. of Light Circuits", tex: "n_{light} = \\lceil \\text{Light points} / 10 \\rceil" },
                    { label: "No. of Power Circuits", tex: "n_{power} = \\lceil \\text{Power points} / 6 \\rceil" },
                    { label: "Wire Quantity", tex: "L_{wire} = \\text{Sum of run lengths} + 10\\% \\text{ wastage}" },
                    { label: "Switch Height", tex: "h_{switch} = 1.2\\text{m to }1.5\\text{m from floor}" },
                    { label: "Socket Height (5A)", tex: "h_{5A} = 0.3\\text{m from floor}" },
                    { label: "Socket Height (15A)", tex: "h_{15A} = 1.2\\text{m from floor}" }
                ]
            },
            {
                id: "c2-3", title: "2.3 — House Wiring Material BOQ",
                boq: {
                    title: "House Wiring BOQ (Interactive)", cols: ["S.No", "Description", "Unit", "Qty", "Rate (₹)", "Amount (₹)"],
                    editable: true, rows: [
                        ["1", "1.5mm² PVC wire (Phase)", "m", "—", "18", "—"], ["2", "1.5mm² PVC wire (Neutral)", "m", "—", "18", "—"],
                        ["3", "1.5mm² PVC wire (Earth)", "m", "—", "16", "—"], ["4", "25mm PVC conduit", "m", "—", "22", "—"],
                        ["5", "1-way switch (6A)", "Nos", "—", "45", "—"], ["6", "2-way switch (6A)", "Nos", "—", "55", "—"],
                        ["7", "5A 3-pin socket", "Nos", "—", "65", "—"], ["8", "15A 3-pin socket", "Nos", "—", "85", "—"],
                        ["9", "Batten holder", "Nos", "—", "30", "—"], ["10", "MCB (6A/10A/16A/32A)", "Nos", "—", "180", "—"],
                        ["11", "RCCB (30mA)", "Nos", "—", "1200", "—"], ["12", "Distribution board (8-way)", "Nos", "—", "850", "—"],
                        ["13", "Conduit clips/saddles", "Nos", "—", "3", "—"], ["14", "Junction boxes", "Nos", "—", "35", "—"],
                        ["15", "Earthing wire (6mm²)", "m", "—", "45", "—"]]
                },
                formulas: [
                    { label: "Wire per point", tex: "L_{wire/point} \\approx \\frac{L_{room}+W_{room}+H}{2} \\times 3" },
                    { label: "Conduit Qty", tex: "L_{conduit} = L_{route} + 10\\%" }
                ]
            },
            {
                id: "c2-4", title: "2.4 — Wiring Layout & Protection", formulas: [
                    { label: "Conduit Fill", tex: "\\text{Fill} = \\frac{\\sum A_{cables}}{A_{conduit}} \\leq 40\\%" },
                    { label: "Max Light Circuit", tex: "30\\text{m length, 10 points max}" },
                    { label: "Max Power Circuit", tex: "20\\text{m length, 2 points (15A) max}" },
                    { label: "RCCB Trip (Domestic)", tex: "I_{trip} = 30\\text{mA}" },
                    { label: "RCCB Trip (Industrial)", tex: "I_{trip} = 100\\text{mA}" },
                    { label: "MCB Type B", tex: "3\\text{-}5 \\times I_n \\text{ (residential)}" },
                    { label: "MCB Type C", tex: "5\\text{-}10 \\times I_n \\text{ (commercial)}" },
                    { label: "MCB Type D", tex: "10\\text{-}20 \\times I_n \\text{ (motor/transformer)}" }
                ], calculator: "voltageDrop"
            }
        ]
    },
    {
        id: 3, icon: "🏭", title: "Industrial & Commercial Wiring", color: "#f97316", cards: [
            {
                id: "c3-1", title: "3.1 — Industrial Load Estimation", formulas: [
                    { label: "Total Connected Load", tex: "TCL = \\sum P_{motors} + \\sum P_{lighting} + \\sum P_{heating} + \\sum P_{misc}" },
                    { label: "Motor Input Power", tex: "P_{input} = \\frac{kW_{shaft}}{\\eta_{motor}}" },
                    { label: "Motor FL Current", tex: "I_{FL} = \\frac{P_{input}}{\\sqrt{3} V_L \\cos\\phi \\times \\eta}" },
                    { label: "DOL Starting Current", tex: "I_{start} = 6\\text{-}8 \\times I_{FL}" },
                    { label: "Star-Delta Starting", tex: "I_{start(Y/\\Delta)} = \\frac{1}{3} \\times I_{start(DOL)}" },
                    { label: "Demand Factor", tex: "DF = \\frac{MD}{TCL}" },
                    { label: "Diversity Factor", tex: "DiF = \\frac{\\sum \\text{Individual MD}}{\\text{Simultaneous MD}} \\geq 1" },
                    { label: "Maximum Demand", tex: "MD = \\frac{TCL \\times DF}{DiF}" },
                    { label: "Load Factor", tex: "LF = \\frac{\\text{Average Demand}}{MD}" },
                    { label: "Annual Energy", tex: "E = MD \\times LF \\times 8760 \\text{ kWh}" }
                ], notes: ["Small workshop DF: 0.5–0.6", "Medium industry DF: 0.6–0.7", "Large industry DF: 0.7–0.8"]
            },
            {
                id: "c3-2", title: "3.2 — Motor Installation Estimation", formulas: [
                    { label: "Motor Feeder Cable", tex: "I_{cable} \\geq 1.25 \\times I_{FL}" },
                    { label: "HRC Fuse", tex: "I_{fuse} = 2 \\times I_{FL}" },
                    { label: "MCCB Rating", tex: "I_{MCCB} = 1.5 \\times I_{FL}" },
                    { label: "OLR Setting", tex: "I_{OLR} = 1.05\\text{-}1.25 \\times I_{FL}" },
                    { label: "Motor Cable CSA", tex: "A = \\frac{\\rho L I_{design}}{\\Delta V_{allowed}}" },
                    { label: "Motor VD Limit", tex: "\\Delta V \\leq 5\\% \\times 415 = 20.75\\text{V}" }
                ],
                boq: {
                    title: "Motor Installation BOQ (per motor)", cols: ["S.No", "Item", "Unit", "Qty"], rows: [
                        ["1", "XLPE/PVC armoured cable", "m", "L"], ["2", "Cable glands (double compression)", "Nos", "2"],
                        ["3", "MCCB/MPCB", "Nos", "1"], ["4", "Contactor (AC3)", "Nos", "1"],
                        ["5", "Overload relay", "Nos", "1"], ["6", "Start/Stop pushbuttons", "Nos", "2"],
                        ["7", "Pilot lamp", "Nos", "1"], ["8", "Control transformer", "Nos", "1"],
                        ["9", "Earthing conductor 6mm²", "m", "L"], ["10", "Cable tray", "m", "L"]]
                },
                calculator: "motorPanel"
            },
            {
                id: "c3-3", title: "3.3 — Distribution Board Design", formulas: [
                    { label: "Bus Bar Current Density (Cu)", tex: "1\\text{-}1.5 \\text{ A/mm}^2" },
                    { label: "Bus Bar Current Density (Al)", tex: "0.8\\text{-}1 \\text{ A/mm}^2" },
                    { label: "Busbar CSA", tex: "A_{busbar} = \\frac{I_{busbar}}{\\text{current density}}" },
                    { label: "Busbar Current", tex: "I_{busbar} = K \\times b \\times t" },
                    { label: "Short Circuit Current", tex: "I_{sc} = \\frac{V}{\\sqrt{3} \\times Z_{system}}" }
                ]
            },
            {
                id: "c3-4", title: "3.4 — Lighting Design (Lumen Method)", formulas: [
                    { label: "Lumen Method", tex: "N = \\frac{E \\times A}{\\phi \\times n \\times UF \\times MF}" },
                    { label: "Spacing Ratio", tex: "S_{max} = 1.0 \\times H_m" },
                    { label: "Mounting Height", tex: "H_m = H_{ceiling} - H_{work} - H_{susp}" },
                    { label: "Room Index", tex: "K = \\frac{L \\times W}{H_m(L + W)}" },
                    { label: "Power Loading", tex: "W/m^2 = \\frac{\\text{Total lamp watts}}{\\text{Area}}" }
                ], where: ["$E$ = Required illuminance (lux)", "$A$ = Room area (m²)", "$\\phi$ = Lumens per lamp", "$UF$ = Utilization Factor (0.4–0.8)", "$MF$ = Maintenance Factor (0.7–0.9)"],
                notes: ["Living room: 150–200 lux", "Office: 300–500 lux", "Factory coarse: 200–300 lux", "Factory fine: 500–1000 lux", "Hospital OT: 1000–2000 lux"],
                calculator: "lumenCalc"
            }
        ]
    },
    {
        id: 4, icon: "🏗️", title: "Overhead & Underground Distribution", color: "#00ff88", cards: [
            {
                id: "c4-1", title: "4.1 — Overhead Line Material Estimation", formulas: [
                    { label: "Pole Quantity", tex: "N_{poles} = \\frac{L_{line}}{S_{span}} + 1" },
                    { label: "Conductor Length", tex: "L_{total} = L_{line} \\times 1.03 \\times n_{conductors}" },
                    { label: "Sag", tex: "S = \\frac{wl^2}{8T}" },
                    { label: "Actual Conductor Length", tex: "L = L_{line} \\times (1 + \\frac{8S^2}{3l^2})" },
                    { label: "3-Phase Total", tex: "L_{3ph} = 3 \\times L_{conductor/phase}" },
                    { label: "With Earth Wire", tex: "L_{total} = 4 \\times L_{conductor/phase}" }
                ], where: ["$w$ = Weight per unit length (kg/m)", "$l$ = Span (m)", "$T$ = Maximum tension (kg)", "Standard span: 50–80m (LV), 200–400m (HV)"]
            },
            {
                id: "c4-2", title: "4.2 — 11kV Overhead Line BOQ (per km)",
                boq: {
                    title: "11kV OH Line BOQ", cols: ["S.No", "Description", "Unit", "Qty"], rows: [
                        ["1", "9m PCC pole (400kg WL)", "Nos", "14"], ["2", "11m steel tubular pole", "Nos", "2"],
                        ["3", "ACSR Dog conductor", "km", "3.09"], ["4", "GI earth wire", "km", "1.03"],
                        ["5", "Pin insulator (11kV)", "Nos", "42"], ["6", "Disc insulator (70kN)", "Nos", "18"],
                        ["7", "Cross arm (MS 75×40mm)", "Nos", "14"], ["8", "Clamp for insulator", "Nos", "42"],
                        ["9", "Binding wire", "kg", "5"], ["10", "Lightning arrester 11kV", "Sets", "2"],
                        ["11", "Guy wire (7/3.15 GI)", "m", "100"], ["12", "Stay rod + anchor", "Sets", "4"],
                        ["13", "PCC foundation block", "Nos", "14"], ["14", "DP structure", "Sets", "1"]]
                }
            },
            {
                id: "c4-3", title: "4.3 — Underground Cable Estimation", formulas: [
                    { label: "Cable Length", tex: "L_{cable} = L_{route} \\times 1.05" },
                    { label: "Trench Depth", tex: "0.75\\text{m (LV)}, \\; 1.0\\text{m (HV)}" },
                    { label: "Sand Filling", tex: "V_{sand} = L \\times W \\times 0.1 \\text{ m}^3" },
                    { label: "Cable Joints", tex: "N_{joints} = \\frac{L_{cable}}{L_{drum}} - 1" },
                    { label: "Terminations", tex: "N_{term} = 2 \\times N_{cable\\ runs}" }
                ],
                boq: {
                    title: "UG Cable BOQ (per km LT)", cols: ["S.No", "Description", "Unit", "Qty"], rows: [
                        ["1", "XLPE 3.5C×300mm² cable", "m", "1050"], ["2", "Trench excavation", "m³", "337"],
                        ["3", "Sand filling", "m³", "33.7"], ["4", "Protective bricks", "Nos", "9782"],
                        ["5", "Route markers", "Nos", "100"], ["6", "Straight joints", "Nos", "2"],
                        ["7", "End terminations", "Sets", "2"], ["8", "Cable tags", "Nos", "10"],
                        ["9", "Backfilling", "m³", "304"], ["10", "Road reinstatement", "m", "300"]]
                }
            }
        ]
    }
];
