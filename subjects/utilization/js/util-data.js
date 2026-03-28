/* ==========================================================================
   UTILIZATION OF ELECTRICAL ENERGY — Formula Data (All 6 Units)
   ========================================================================== */
window.UTIL_DATA = {
    units: [
        /* ======== UNIT 1 — ELECTRIC DRIVES ======== */
        {
            id: 1, icon: '🔧', title: 'Electric Drives', color: '#f97316',
            cards: [
                {
                    id: '1.1', title: 'Types of Electric Drives',
                    infoCards: [
                        { title: 'GROUP DRIVE', desc: 'Single motor drives a group of machines', color: '#f97316' },
                        { title: 'INDIVIDUAL', desc: 'Each machine has its own motor', color: '#fb923c' },
                        { title: 'MULTI-MOTOR', desc: 'Several motors on same mechanism', color: '#fdba74' }
                    ],
                    formulas: [
                        { label: 'Drive Components', tex: '\\text{Electric Drive} = \\text{Motor} + \\text{Power Converter} + \\text{Control Unit} + \\text{Mech. Transmission}' },
                        { label: 'Load Torque Components', tex: 'T_L = T_{friction} + T_{windage} + T_{useful}' },
                        { label: 'Coulomb Friction', tex: 'T_{friction} = \\text{constant}' },
                        { label: 'Viscous Friction (Windage)', tex: 'T_{windage} = K_w \\omega^2' }
                    ],
                    svg: 'drive-block'
                },
                {
                    id: '1.2', title: 'Power Requirement Calculations',
                    formulas: [
                        { label: 'Mechanical Power', tex: 'P = T \\times \\omega = T \\times \\frac{2\\pi N}{60}' },
                        { label: 'Power (kW)', tex: 'P(\\text{kW}) = \\frac{T \\times N}{9550}' },
                        { label: 'HP Conversion', tex: '1\\text{ HP} = 746\\text{ W} = 0.746\\text{ kW}' },
                        { label: 'Motor Input Power', tex: 'P_{input} = \\frac{P_{output}}{\\eta_{motor}}' },
                        { label: 'Hoisting/Lifting', tex: 'P_{lift} = \\frac{m \\times g \\times v}{\\eta}' },
                        { label: 'Pump Power', tex: 'P_{pump} = \\frac{\\rho g Q H}{\\eta_{pump} \\times \\eta_{motor}}' },
                        { label: 'Fan Power', tex: 'P_{fan} = \\frac{Q \\Delta P}{\\eta_{fan} \\times \\eta_{motor}}' },
                        { label: 'Net Torque (Acceleration)', tex: 'T_{net} = T_{motor} - T_{load} = J \\frac{d\\omega}{dt}' },
                        { label: 'Flywheel Equation', tex: 'J = \\frac{GD^2}{4g}' },
                        { label: 'Acceleration Torque', tex: 'T_{acc} = \\frac{GD^2}{375} \\times \\frac{dN}{dt}' },
                        { label: 'Equivalent Inertia', tex: 'J_{eq} = J_{motor} + J_{load} \\times \\left(\\frac{\\omega_L}{\\omega_M}\\right)^2' },
                        { label: 'Gear Ratio', tex: 'i = \\frac{N_{motor}}{N_{load}} = \\frac{\\omega_M}{\\omega_L}' },
                        { label: 'Optimum Gear Ratio', tex: 'i_{opt} = \\sqrt{\\frac{J_{load}}{J_{motor}}}' },
                        { label: 'Duty Cycle', tex: '\\text{Duty Cycle} = \\frac{t_{on}}{t_{on} + t_{off}} \\times 100\\%' },
                        { label: 'RMS Current', tex: 'I_{rms} = I_{load}\\sqrt{\\frac{t_{on}}{t_{on}+t_{off}}}' },
                        { label: 'Motor Rating (Intermittent)', tex: 'P_{rated} = P_{load} \\times \\sqrt{\\text{duty cycle}}' }
                    ],
                    calculator: 'motor-power',
                    svg: 'torque-speed'
                },
                {
                    id: '1.3', title: 'Motor Selection for Applications',
                    formulas: [
                        { label: 'Constant Torque Load', tex: 'T_L = \\text{const},\\quad P \\propto N' },
                        { label: 'Variable Torque Load', tex: 'T_L \\propto N^2,\\quad P \\propto N^3' },
                        { label: 'Constant Power Load', tex: 'P = \\text{const},\\quad T \\propto \\frac{1}{N}' },
                        { label: 'Affinity Law — Flow', tex: '\\frac{Q_2}{Q_1} = \\frac{N_2}{N_1}' },
                        { label: 'Affinity Law — Head', tex: '\\frac{H_2}{H_1} = \\left(\\frac{N_2}{N_1}\\right)^2' },
                        { label: 'Affinity Law — Power', tex: '\\frac{P_2}{P_1} = \\left(\\frac{N_2}{N_1}\\right)^3' }
                    ],
                    table: {
                        headers: ['Application', 'Preferred Motor'],
                        rows: [
                            ['Centrifugal pump', '3-ph Squirrel cage IM'],
                            ['Air compressor', '3-ph Squirrel cage IM'],
                            ['Crane/Hoist', 'Wound rotor IM / DC series'],
                            ['Conveyor (heavy)', 'DC shunt / Slip-ring IM'],
                            ['Traction (train)', 'DC series / VVVF IM'],
                            ['Textile machine', 'DC shunt (speed control)'],
                            ['Machine tool (lathe)', 'DC shunt / Servo motor'],
                            ['Mixer/Grinder', 'Universal (AC/DC) motor'],
                            ['Elevator/Lift', 'Gearless PMSM / Wound IM'],
                            ['Fan/Blower', 'Squirrel cage IM'],
                            ['Paper mill', 'DC separately excited'],
                            ['Steel rolling mill', 'DC motor (Ward-Leonard)']
                        ]
                    },
                    calculator: 'affinity-laws',
                    svg: 'load-types'
                },
                {
                    id: '1.4', title: 'Braking Methods',
                    tabs: ['Regenerative', 'Plugging', 'Dynamic', 'DC Injection'],
                    tabContent: [
                        {
                            formulas: [
                                { label: 'Regenerated Power', tex: 'P_{regen} = T_{braking} \\times \\omega' },
                                { label: 'Energy Saved', tex: 'E_{saved} = P_{regen} \\times t_{braking}' },
                                { label: 'Condition (IM)', tex: '\\text{Only when } N > N_{sync}' }
                            ]
                        },
                        {
                            formulas: [
                                { label: 'Plugging Torque', tex: 'T_{plugging} \\approx 2T_{max} \\text{ (initially)}' },
                                { label: 'Plugging Resistance', tex: 'R_{plugging} = \\frac{V_{supply} - E_{back}}{I_{braking}}' },
                                { label: 'Energy Dissipated', tex: 'E = J\\omega_0^2 + \\text{Supply energy}' }
                            ]
                        },
                        {
                            formulas: [
                                { label: 'Braking Current', tex: 'I_{braking} = \\frac{E_{back}}{R_{brake} + R_{armature}}' },
                                { label: 'Braking Torque', tex: 'T_{braking} = K\\phi I_{braking}' },
                                { label: 'Energy Dissipated', tex: 'E_{dissipated} = \\frac{1}{2}J\\omega_0^2' }
                            ]
                        },
                        {
                            formulas: [
                                { label: 'Braking Torque', tex: 'T_{braking} \\propto I_{DC}^2' },
                                { label: 'Principle', tex: '\\text{DC injected into stator} \\rightarrow \\text{stationary braking field}' }
                            ]
                        }
                    ],
                    table: {
                        headers: ['Braking Method', 'Energy Recovery', 'Braking Torque', 'Speed Range'],
                        rows: [
                            ['Regenerative', 'Yes (best)', 'Smooth', 'Above sync'],
                            ['Plugging', 'No (waste)', 'Highest', 'Full range'],
                            ['Dynamic', 'No (heat)', 'Good', 'Full range'],
                            ['DC Injection', 'No (heat)', 'Smooth', 'Full range']
                        ]
                    },
                    svg: 'braking-curves'
                }
            ]
        },
        /* ======== UNIT 2 — ILLUMINATION ENGINEERING ======== */
        {
            id: 2, icon: '💡', title: 'Illumination Engineering', color: '#facc15',
            cards: [
                {
                    id: '2.1', title: 'Fundamental Photometric Quantities',
                    formulas: [
                        { label: 'Luminous Flux', tex: '\\phi_{total} = 4\\pi I \\quad \\text{(Lumen, lm — for uniform point source)}' },
                        { label: 'Luminous Intensity', tex: 'I = \\frac{d\\phi}{d\\omega} \\quad \\text{(Candela, cd = lm/sr)}' },
                        { label: 'Illuminance', tex: 'E = \\frac{d\\phi}{dA} \\quad \\text{(Lux = lm/m}^2\\text{)}' },
                        { label: 'Luminance', tex: 'L = \\frac{I}{A\\cos\\theta} \\quad \\text{(cd/m}^2\\text{)}' },
                        { label: 'Luminous Efficacy', tex: '\\eta_{efficacy} = \\frac{\\phi_{lumen}}{P_{watt}} \\quad \\text{(lm/W)}' }
                    ]
                },
                {
                    id: '2.2', title: 'Laws of Illumination',
                    formulas: [
                        { label: 'Inverse Square Law', tex: 'E = \\frac{I}{d^2}', highlight: true },
                        { label: "Lambert's Cosine Law", tex: 'E = \\frac{I\\cos\\theta}{d^2}' },
                        { label: 'Combined Law (General)', tex: '\\boxed{E = \\frac{I\\cos^3\\theta}{h^2}}', highlight: true },
                        { label: 'Point Below Lamp (θ=0)', tex: 'E_{max} = \\frac{I}{h^2}' },
                        { label: 'Horizontal Illuminance', tex: 'E_H = \\frac{I h}{(h^2+x^2)^{3/2}} = \\frac{I\\cos^3\\theta}{h^2}' },
                        { label: 'Multiple Sources', tex: 'E_{total} = \\sum \\frac{I_n\\cos^3\\theta_n}{h_n^2}' }
                    ],
                    svg: 'inverse-square',
                    calculator: 'illuminance'
                },
                {
                    id: '2.3', title: 'Lumen Method & Lighting Design',
                    formulas: [
                        { label: 'Number of Luminaires', tex: 'N = \\frac{E \\times A}{\\phi_{lamp} \\times n \\times UF \\times MF}', highlight: true },
                        { label: 'Room Index', tex: 'K = \\frac{L \\times W}{H_m(L+W)}' },
                        { label: 'Mounting Height', tex: 'H_m = H_{ceiling} - H_{work} - H_{suspension}' },
                        { label: 'Spacing-Height Ratio', tex: 'SHR = \\frac{S_{spacing}}{H_{mounting}} \\leq SHR_{max}' },
                        { label: 'Power Loading', tex: 'W/m^2 = \\frac{N \\times P_{lamp}}{A_{room}}' },
                        { label: 'Depreciation Factor', tex: 'DF = LLMF \\times LSF \\times LMF \\times RSMF' }
                    ],
                    calculator: 'lumen-method'
                },
                {
                    id: '2.4', title: 'Types of Lamps — Comparison',
                    formulas: [
                        { label: 'Incandescent', tex: '\\eta = 8\\text{-}15 \\text{ lm/W},\\; T_{fil} \\approx 2800\\text{K},\\; \\text{Life: 1000 hrs}' },
                        { label: 'Stefan-Boltzmann', tex: 'P_{rad} = \\epsilon \\sigma A T^4,\\; \\sigma = 5.67\\times10^{-8} \\text{ W/m}^2\\text{K}^4' },
                        { label: 'Fluorescent', tex: '\\eta = 50\\text{-}90 \\text{ lm/W},\\; \\text{Life: 8k-15k hrs},\\; \\text{CRI: 80-90}' },
                        { label: 'LPS Sodium', tex: '\\eta = 150\\text{-}200 \\text{ lm/W (highest!)},\\; \\lambda = 589\\text{ nm},\\; \\text{CRI: 0}' },
                        { label: 'HPS Sodium', tex: '\\eta = 80\\text{-}130 \\text{ lm/W},\\; \\text{Life: 12k-24k hrs}' },
                        { label: 'LED', tex: '\\eta = 80\\text{-}200+ \\text{ lm/W},\\; \\text{Life: 25k-100k hrs},\\; \\text{CRI: 80-98}' },
                        { label: 'LED Thermal Model', tex: 'T_j = T_a + P_d \\times R_{th(j-a)}' }
                    ],
                    table: {
                        headers: ['Lamp', 'Efficacy', 'Life(hrs)', 'CRI', 'CCT(K)'],
                        rows: [
                            ['Incandescent', '8-15 lm/W', '1000', '100', '2700'],
                            ['Halogen', '15-25 lm/W', '2000', '100', '3000'],
                            ['CFL', '50-70 lm/W', '10000', '80-85', '2700-6500'],
                            ['Fluorescent', '60-90 lm/W', '15000', '85', '3000-6500'],
                            ['HPMV Mercury', '40-60 lm/W', '8000', '40', '3500'],
                            ['LPS Sodium', '150-200', '18000', '0', '1800'],
                            ['HPS Sodium', '80-130', '24000', '20-25', '2000'],
                            ['Metal Halide', '75-100', '10000', '65-85', '3000-6000'],
                            ['LED', '80-200+', '50000', '80-98', '2700-6500']
                        ]
                    },
                    svg: 'lamp-efficacy-chart'
                },
                {
                    id: '2.5', title: 'Street & Outdoor Lighting',
                    formulas: [
                        { label: 'Average Illuminance', tex: 'E_{avg} = \\frac{\\phi_{lamp} \\times \\eta_{str} \\times UF}{S_{spacing} \\times W_{road}}' },
                        { label: 'Uniformity Ratio', tex: 'U_0 = \\frac{E_{min}}{E_{avg}} \\geq 0.4' },
                        { label: 'Overall Uniformity', tex: 'U_1 = \\frac{E_{min}}{E_{max}} \\geq 0.25' }
                    ],
                    notes: [
                        'Motorway: L_avg = 2 cd/m²',
                        'Main road: L_avg = 1 cd/m²',
                        'Secondary road: E_avg = 15 lux',
                        'Residential: E_avg = 5-10 lux'
                    ]
                }
            ]
        },
        /* ======== UNIT 3 — ELECTRIC HEATING & WELDING ======== */
        {
            id: 3, icon: '🔥', title: 'Electric Heating & Welding', color: '#ef4444',
            cards: [
                {
                    id: '3.1', title: 'Principles of Electric Heating',
                    formulas: [
                        { label: "Joule's Law", tex: 'Q = I^2 R t = \\frac{V^2}{R} t = VIt \\quad \\text{(Joules)}', highlight: true },
                        { label: 'Calorie Conversion', tex: '1 \\text{ cal} = 4.186 \\text{ J},\\quad 1 \\text{ kWh} = 860 \\text{ kcal}' },
                        { label: 'Heat for Temp Rise', tex: 'Q_{heat} = m \\times c \\times \\Delta\\theta' },
                        { label: 'Heating Time', tex: 't = \\frac{m \\times c \\times \\Delta\\theta}{P_{heater} \\times \\eta}' },
                        { label: 'Heater Efficiency', tex: '\\eta = \\frac{m c \\Delta\\theta}{VIt}' },
                        { label: 'Resistance Element', tex: 'R_{element} = \\frac{\\rho L}{A}' },
                        { label: 'Element Length', tex: 'L = \\frac{R \\times A}{\\rho}' },
                        { label: 'Stefan-Boltzmann Radiation', tex: 'Q_{rad} = \\epsilon \\sigma A(T_s^4 - T_{amb}^4)' }
                    ],
                    calculator: 'heating-time'
                },
                {
                    id: '3.2', title: 'Types of Electric Furnaces',
                    tabs: ['Resistance', 'Induction', 'Arc', 'Dielectric'],
                    tabContent: [
                        {
                            formulas: [
                                { label: 'Direct Resistance', tex: 'P = I^2 R_{charge},\\quad T_{max} \\approx 1200°C' },
                                { label: 'Indirect Resistance', tex: 'P = I^2 R_{element}' },
                                { label: 'Element Materials', tex: '\\text{Nichrome: 1100°C, Kanthal: 1400°C, SiC: 1650°C}' }
                            ]
                        },
                        {
                            formulas: [
                                { label: 'Core-type (LF)', tex: 'E_s = 4.44 f N_s \\phi_m' },
                                { label: 'Eddy Current Loss', tex: 'P_{eddy} = K_e f^2 B_m^2 t^2 V' },
                                { label: 'Hysteresis Loss', tex: 'P_{hyst} = K_h f B_m^{1.6} V' },
                                { label: 'Skin Depth', tex: '\\delta = \\sqrt{\\frac{\\rho}{\\pi \\mu f}}', highlight: true },
                                { label: 'HF Resonant Freq', tex: 'f_{HF} = \\frac{1}{2\\pi\\sqrt{LC}}' }
                            ]
                        },
                        {
                            formulas: [
                                { label: 'Arc Power', tex: 'P_{arc} = V_{arc} \\times I_{arc}' },
                                { label: 'Arc Voltage', tex: 'V_{arc} = V_{contact} + E_{col} \\times l_{arc}' },
                                { label: '3-Phase Arc', tex: 'P_{3\\phi} = 3 V_{phase} I_{arc} \\cos\\phi' },
                                { label: 'Arc Temperature', tex: 'T_{arc} \\approx 3500°C\\text{-}6000°C' },
                                { label: 'Transformer Rating', tex: 'kVA = \\sqrt{3} V_L I_L' }
                            ]
                        },
                        {
                            formulas: [
                                { label: 'Dielectric Heating', tex: 'P = 2\\pi f \\epsilon_0 \\epsilon_r \\tan\\delta \\cdot E^2 V' }
                            ]
                        }
                    ],
                    svg: 'furnace-types'
                },
                {
                    id: '3.3', title: 'Electric Welding',
                    tabs: ['Arc Welding', 'Resistance Welding'],
                    tabContent: [
                        {
                            formulas: [
                                { label: 'Arc Power', tex: 'P_{arc} = V_{arc} \\times I_{arc}' },
                                { label: 'Heat Input/Length', tex: 'H = \\frac{V_{arc} \\times I_{arc} \\times \\eta_w}{v}', highlight: true },
                                { label: 'Open Circuit Voltage', tex: 'V_{OC} = 60\\text{-}80 \\text{ V (AC)},\\; 45\\text{-}90 \\text{ V (DC)}' },
                                { label: 'Typical Values', tex: 'V_{arc} = 15\\text{-}45\\text{ V},\\; I_{arc} = 50\\text{-}1000\\text{ A}' }
                            ]
                        },
                        {
                            formulas: [
                                { label: 'Spot Welding Heat', tex: 'Q = I^2 R_{contact} t', highlight: true },
                                { label: 'Nugget Temp', tex: 'T = T_{amb} + \\frac{I^2 R t}{m \\times c}' },
                                { label: 'Welding Current', tex: 'I_{weld} = \\sqrt{\\frac{Q_{req}}{R_{contact} \\times t}}' },
                                { label: 'Nugget Radius', tex: 'r \\approx 4\\sqrt{t_{sheet}}' },
                                { label: 'Seam Weld Duty', tex: '\\text{DC} = \\frac{t_{on}}{t_{on}+t_{off}} \\times 100\\%' }
                            ]
                        }
                    ],
                    svg: 'welding-anim'
                }
            ]
        },
        /* ======== UNIT 4 — ELECTRIC TRACTION ======== */
        {
            id: 4, icon: '🚂', title: 'Electric Traction', color: '#00f5ff',
            cards: [
                {
                    id: '4.1', title: 'Systems of Track Electrification',
                    infoCards: [
                        { title: '600V DC', desc: 'Tramways, Metro', color: '#00f5ff' },
                        { title: '750V DC', desc: 'Underground/Metro rail', color: '#22d3ee' },
                        { title: '1500V DC', desc: 'Suburban railways', color: '#06b6d4' },
                        { title: '3000V DC', desc: 'Main line (some countries)', color: '#0891b2' },
                        { title: '25kV 50Hz AC', desc: 'Indian Railways', color: '#f97316' },
                        { title: '15kV 16.7Hz', desc: 'European countries', color: '#facc15' }
                    ],
                    formulas: [
                        { label: 'OHE Voltage', tex: 'V_{catenary} = V_{nominal} \\pm 10\\%' }
                    ]
                },
                {
                    id: '4.2', title: 'Mechanics of Train Movement',
                    formulas: [
                        { label: 'Total Tractive Effort', tex: 'F_T = M\\alpha(1+\\lambda) + 9.81MG + \\frac{6116M}{R} + M(A+Bv+Cv^2)', highlight: true },
                        { label: 'Accelerating Force', tex: 'F_a = (1 + \\lambda) \\times M \\times \\alpha' },
                        { label: 'Gravity Resistance', tex: 'F_g = M \\times g \\times \\sin\\theta \\approx 9.81 \\times M \\times G/1000' },
                        { label: 'Curve Resistance', tex: 'F_c = \\frac{6116 \\times M}{R} \\quad \\text{(N)}' },
                        { label: 'Davis Formula', tex: 'F_r = M(A + Bv + Cv^2) \\quad \\text{(frictional)}' },
                        { label: 'Drawbar Power', tex: 'P_{kW} = \\frac{F_T \\times v}{1000}' },
                        { label: 'Adhesion Limit', tex: 'F_{T,max} = \\mu \\times W_{adhesive}' },
                        { label: 'Dry Rail', tex: '\\mu = 0.25\\text{-}0.35' },
                        { label: 'Wet Rail', tex: '\\mu = 0.10\\text{-}0.15' }
                    ]
                },
                {
                    id: '4.3', title: 'Speed-Time Curves',
                    formulas: [
                        { label: 'Acceleration', tex: '\\alpha = \\frac{V_m}{t_1} \\quad \\text{(km/h/s)}' },
                        { label: 'Braking Rate', tex: '\\beta = \\frac{V_m}{t_3} \\quad \\text{(km/h/s)}' },
                        { label: 'Distance (Accel)', tex: 's_1 = \\frac{V_m \\times t_1}{7.2} \\quad \\text{(m)}' },
                        { label: 'Distance (Free Run)', tex: 's_2 = \\frac{V_m \\times t_2}{3.6} \\quad \\text{(m)}' },
                        { label: 'Distance (Braking)', tex: 's_3 = \\frac{V_m \\times t_3}{7.2} \\quad \\text{(m)}' },
                        { label: 'Total Distance', tex: 'D = s_1 + s_2 + s_3' },
                        { label: 'Schedule Speed', tex: 'V_{sch} = \\frac{D}{T_{total}}' },
                        { label: 'Average Speed', tex: 'V_{avg} = \\frac{D}{t_1 + t_2 + t_3}' },
                        { label: 'Acceleration Energy', tex: 'E_{acc} = \\frac{(1+\\lambda)Mv_m^2}{7200} \\quad \\text{(Wh)}' },
                        { label: 'Specific Energy', tex: 'E_{spec} = \\frac{E_{total}}{M \\times D} \\quad \\text{(Wh/t·km)}' },
                        { label: 'Regenerative Saving', tex: 'E_{net} = E_{acc} - \\eta_{regen} \\times E_{braking}' }
                    ],
                    calculator: 'speed-time',
                    svg: 'speed-time-curve'
                },
                {
                    id: '4.4', title: 'Traction Motors',
                    tabs: ['DC Series', 'Induction (VVVF)'],
                    tabContent: [
                        {
                            formulas: [
                                { label: 'Torque (Low Speed)', tex: 'T \\propto I^2' },
                                { label: 'Torque (High Speed)', tex: 'T \\propto I \\quad \\text{(saturation)}' },
                                { label: 'Speed', tex: 'N \\propto \\frac{V - IR_{total}}{\\phi}' },
                                { label: 'Series Connection', tex: 'V_{motor} = \\frac{V_{supply}}{n_{motors}}' },
                                { label: 'Parallel Connection', tex: 'V_{motor} = V_{supply}' }
                            ]
                        },
                        {
                            formulas: [
                                { label: 'Synchronous Speed', tex: 'N_s = \\frac{120f}{P}' },
                                { label: 'Rotor Speed', tex: 'N_r = N_s(1-s)' },
                                { label: 'Torque', tex: 'T \\propto \\frac{sE_2^2R_2}{R_2^2+s^2X_2^2}' },
                                { label: 'VVVF Principle', tex: '\\frac{V}{f} = \\text{constant (constant flux)}' },
                                { label: 'Max Torque', tex: 'T_{max} = \\frac{3V^2}{2\\omega_s X_s}' }
                            ]
                        }
                    ]
                }
            ]
        },
        /* ======== UNIT 5 — ELECTROLYTIC PROCESSES ======== */
        {
            id: 5, icon: '⚗️', title: 'Electrolytic Processes', color: '#a78bfa',
            cards: [
                {
                    id: '5.1', title: "Faraday's Laws of Electrolysis",
                    formulas: [
                        { label: 'First Law', tex: 'm = Z \\times I \\times t = Z \\times Q', highlight: true },
                        { label: 'Second Law', tex: 'm = \\frac{M \\times I \\times t}{n \\times F}', highlight: true },
                        { label: 'ECE', tex: 'Z = \\frac{M}{n \\times F} \\quad \\text{(g/C)}' },
                        { label: "Faraday's Constant", tex: 'F = 96485 \\text{ C/mol} \\approx 96500 \\text{ C/mol}' },
                        { label: 'Z (Copper)', tex: 'Z_{Cu} = \\frac{63.5}{2 \\times 96500} = 3.29 \\times 10^{-4}' },
                        { label: 'Z (Silver)', tex: 'Z_{Ag} = \\frac{107.9}{1 \\times 96500} = 11.18 \\times 10^{-4}' },
                        { label: 'Z (Zinc)', tex: 'Z_{Zn} = \\frac{65.4}{2 \\times 96500} = 3.39 \\times 10^{-4}' },
                        { label: 'Z (Aluminium)', tex: 'Z_{Al} = \\frac{27}{3 \\times 96500} = 9.32 \\times 10^{-5}' },
                        { label: 'Z (Gold)', tex: 'Z_{Au} = \\frac{197}{3 \\times 96500} = 6.81 \\times 10^{-4}' }
                    ],
                    calculator: 'faraday',
                    svg: 'electrolysis-tank'
                },
                {
                    id: '5.2', title: 'Electroplating',
                    formulas: [
                        { label: 'Deposit Thickness', tex: 'd = \\frac{Z \\times I \\times t}{\\rho \\times A}', highlight: true },
                        { label: 'Plating Time', tex: 't = \\frac{d \\times \\rho \\times A}{Z \\times I}' },
                        { label: 'Current Required', tex: 'I = \\frac{d \\times \\rho \\times A}{Z \\times t}' },
                        { label: 'Current Density', tex: 'j = \\frac{I}{A} \\quad \\text{(A/m}^2\\text{)}' },
                        { label: 'Current Efficiency', tex: '\\eta_c = \\frac{m_{actual}}{Z \\times I \\times t} \\times 100\\%' },
                        { label: 'Energy Consumption', tex: 'E_{kWh} = \\frac{V_{cell} \\times I \\times t}{3.6 \\times 10^6}' },
                        { label: 'Cell Voltage', tex: 'V_{cell} = E_{decomp} + I(R_{elec} + R_{electrode})' }
                    ],
                    calculator: 'plating'
                },
                {
                    id: '5.3', title: 'Galvanizing & Anodizing',
                    tabs: ['Hot Dip Galvanizing', 'Anodizing (Al)'],
                    tabContent: [
                        {
                            formulas: [
                                { label: 'Zinc Thickness', tex: 'd_{Zn} = \\frac{m_{Zn}}{\\rho_{Zn} \\times A},\\; \\rho_{Zn} = 7133 \\text{ kg/m}^3' },
                                { label: 'Corrosion Life', tex: '\\text{Life} \\approx \\frac{d_{Zn}(\\mu m)}{1.5 \\text{ to } 7 \\; \\mu m/yr}' }
                            ]
                        },
                        {
                            formulas: [
                                { label: 'Oxide Rule', tex: 'd \\approx 0.3 \\text{ μm per C/cm}^2' },
                                { label: 'Anodize Thickness', tex: '5\\text{-}25 \\; \\mu m \\text{ typical}' },
                                { label: 'Conditions', tex: 'j = 1\\text{-}2 \\text{ A/dm}^2,\\; V = 12\\text{-}20 \\text{ V}' }
                            ]
                        }
                    ]
                }
            ]
        },
        /* ======== UNIT 6 — REFRIGERATION & AC ======== */
        {
            id: 6, icon: '❄️', title: 'Refrigeration & Air Conditioning', color: '#60a5fa',
            cards: [
                {
                    id: '6.1', title: 'Refrigeration Fundamentals',
                    formulas: [
                        { label: 'COP (Refrigerator)', tex: 'COP_R = \\frac{Q_L}{W_{net}} = \\frac{Q_L}{Q_H - Q_L}', highlight: true },
                        { label: 'COP (Heat Pump)', tex: 'COP_{HP} = \\frac{Q_H}{W_{net}} = COP_R + 1' },
                        { label: 'Carnot COP', tex: 'COP_{Carnot} = \\frac{T_L}{T_H - T_L}' },
                        { label: 'Refrigerating Effect', tex: 'RE = h_1 - h_4 \\quad \\text{(kJ/kg)}' },
                        { label: 'Work of Compression', tex: 'W = h_2 - h_1 \\quad \\text{(kJ/kg)}' },
                        { label: 'COP (Vapour Compression)', tex: 'COP = \\frac{h_1 - h_4}{h_2 - h_1}' },
                        { label: 'Ton of Refrigeration', tex: '1 \\text{ TR} = 3.517 \\text{ kW} = 12000 \\text{ BTU/hr}' },
                        { label: 'Mass Flow Rate', tex: '\\dot{m} = \\frac{Q_L}{RE} \\quad \\text{(kg/s)}' },
                        { label: 'Compressor Power', tex: 'P = \\dot{m}(h_2 - h_1) \\quad \\text{(kW)}' },
                        { label: 'EER', tex: 'EER = COP \\times 3.412' },
                        { label: 'ISEER Stars', tex: '\\text{5-star:}\\; ISEER \\geq 5.0,\\; \\text{3-star:}\\; 3.5\\text{-}4.5' }
                    ],
                    calculator: 'cop',
                    svg: 'vapour-compression'
                },
                {
                    id: '6.2', title: 'Refrigerator Electrical Circuit',
                    formulas: [
                        { label: 'Compressor Current (1-ph)', tex: 'I = \\frac{P}{V\\cos\\phi}' },
                        { label: 'Compressor Current (3-ph)', tex: 'I = \\frac{P}{\\sqrt{3}V_L\\cos\\phi}' },
                        { label: 'Starting Current', tex: 'I_{start} = 4\\text{-}6 \\times I_{FL}' },
                        { label: 'Thermostat Cut-out', tex: 'T_{cut-out} = T_{set} - \\frac{\\text{diff}}{2}' },
                        { label: 'Thermostat Cut-in', tex: 'T_{cut-in} = T_{set} + \\frac{\\text{diff}}{2}' },
                        { label: 'Defrost Heater Power', tex: 'P_{defrost} = \\frac{m_{frost} \\times L_{fusion}}{t_{defrost}},\\; L = 334 \\text{ kJ/kg}' }
                    ],
                    svg: 'fridge-circuit'
                },
                {
                    id: '6.3', title: 'Air Conditioning System',
                    formulas: [
                        { label: 'Total Cooling Load', tex: 'Q_{total} = Q_{sensible} + Q_{latent}' },
                        { label: 'Sensible Heat', tex: 'Q_s = \\dot{m}_{air} c_p (T_{room}-T_{supply})' },
                        { label: 'Latent Heat', tex: 'Q_L = \\dot{m}_{air} h_{fg} (W_{room}-W_{supply})' },
                        { label: 'SHR', tex: 'SHR = \\frac{Q_s}{Q_s + Q_L}' },
                        { label: 'Air Flow Rate', tex: '\\dot{m}_{air} = \\frac{Q_s}{c_p(T_{room}-T_{supply})}' },
                        { label: 'Specific Humidity', tex: 'W = 0.622 \\frac{p_v}{p_{atm}-p_v}' },
                        { label: 'Relative Humidity', tex: '\\phi = \\frac{p_v}{p_{sat}} \\times 100\\%' },
                        { label: 'Inverter AC Saving', tex: '\\text{Saving} = \\left(1-\\frac{f_{actual}}{f_{rated}}\\right)^3 \\times 100\\%' },
                        { label: 'Water Cooler', tex: 'Q = \\dot{m}_w \\times c_w \\times (T_{in} - T_{out})' }
                    ],
                    calculator: 'ac-load'
                }
            ]
        }
    ]
};
