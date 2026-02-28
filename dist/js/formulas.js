/* ============================================
   EE Formula Hub — Formula Data
   ============================================ */
const FORMULA_DATA = [
    // ──── 1. Circuit Theory ────
    {
        id: "ohm-v", name: "Ohm's Law (Voltage)", category: "circuit",
        latex: "V = I \\cdot R",
        description: "Voltage across a resistor equals current times resistance.",
        units: "V = Volts (V), I = Amperes (A), R = Ohms (Ω)",
        variables: [
            { sym: "V", label: "Voltage (V)", unit: "V" },
            { sym: "I", label: "Current (A)", unit: "A" },
            { sym: "R", label: "Resistance (Ω)", unit: "Ω" }
        ],
        calc: (vars) => {
            if (vars.I && vars.R) return { result: vars.I * vars.R, unit: "V", label: "Voltage" };
            if (vars.V && vars.R) return { result: vars.V / vars.R, unit: "A", label: "Current" };
            if (vars.V && vars.I) return { result: vars.V / vars.I, unit: "Ω", label: "Resistance" };
            return null;
        }
    },
    {
        id: "power-vi", name: "Electrical Power", category: "circuit",
        latex: "P = V \\cdot I",
        description: "Power dissipated equals voltage times current.",
        units: "P = Watts (W), V = Volts (V), I = Amperes (A)",
        variables: [
            { sym: "P", label: "Power (W)", unit: "W" },
            { sym: "V", label: "Voltage (V)", unit: "V" },
            { sym: "I", label: "Current (A)", unit: "A" }
        ],
        calc: (vars) => {
            if (vars.V && vars.I) return { result: vars.V * vars.I, unit: "W", label: "Power" };
            if (vars.P && vars.I) return { result: vars.P / vars.I, unit: "V", label: "Voltage" };
            if (vars.P && vars.V) return { result: vars.P / vars.V, unit: "A", label: "Current" };
            return null;
        }
    },
    {
        id: "power-i2r", name: "Power (I²R)", category: "circuit",
        latex: "P = I^{2} \\cdot R",
        description: "Power dissipated in terms of current and resistance.",
        units: "P = Watts (W), I = Amperes (A), R = Ohms (Ω)",
        variables: [
            { sym: "P", label: "Power (W)", unit: "W" },
            { sym: "I", label: "Current (A)", unit: "A" },
            { sym: "R", label: "Resistance (Ω)", unit: "Ω" }
        ],
        calc: (vars) => {
            if (vars.I && vars.R) return { result: vars.I ** 2 * vars.R, unit: "W", label: "Power" };
            if (vars.P && vars.R) return { result: Math.sqrt(vars.P / vars.R), unit: "A", label: "Current" };
            if (vars.P && vars.I) return { result: vars.P / (vars.I ** 2), unit: "Ω", label: "Resistance" };
            return null;
        }
    },
    {
        id: "series-r", name: "Series Resistance", category: "circuit",
        latex: "R_{total} = R_1 + R_2 + \\cdots + R_n",
        description: "Total resistance in a series circuit is the sum of individual resistances.",
        units: "R = Ohms (Ω)"
    },
    {
        id: "parallel-r", name: "Parallel Resistance", category: "circuit",
        latex: "\\frac{1}{R_{total}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\cdots + \\frac{1}{R_n}",
        description: "Reciprocal of total resistance is the sum of reciprocals of each resistance.",
        units: "R = Ohms (Ω)"
    },
    {
        id: "kcl", name: "Kirchhoff's Current Law (KCL)", category: "circuit",
        latex: "\\sum_{k=1}^{n} I_k = 0",
        description: "The algebraic sum of all currents entering and leaving a node is zero.",
        units: "I = Amperes (A)"
    },
    {
        id: "kvl", name: "Kirchhoff's Voltage Law (KVL)", category: "circuit",
        latex: "\\sum_{k=1}^{n} V_k = 0",
        description: "The algebraic sum of all voltages around any closed loop is zero.",
        units: "V = Volts (V)"
    },
    {
        id: "vdiv", name: "Voltage Divider", category: "circuit",
        latex: "V_{out} = V_{in} \\cdot \\frac{R_2}{R_1 + R_2}",
        description: "Output voltage of a voltage divider network.",
        units: "V = Volts (V), R = Ohms (Ω)",
        variables: [
            { sym: "Vin", label: "V_in (V)", unit: "V" },
            { sym: "R1", label: "R₁ (Ω)", unit: "Ω" },
            { sym: "R2", label: "R₂ (Ω)", unit: "Ω" }
        ],
        calc: (vars) => {
            if (vars.Vin && vars.R1 && vars.R2) return { result: vars.Vin * vars.R2 / (vars.R1 + vars.R2), unit: "V", label: "V_out" };
            return null;
        }
    },
    {
        id: "cdiv", name: "Current Divider", category: "circuit",
        latex: "I_1 = I_{total} \\cdot \\frac{R_2}{R_1 + R_2}",
        description: "Current through one branch of a two-branch parallel circuit.",
        units: "I = Amperes (A), R = Ohms (Ω)"
    },
    {
        id: "impedance", name: "Impedance (Series RLC)", category: "circuit",
        latex: "Z = \\sqrt{R^2 + (X_L - X_C)^2}",
        description: "Magnitude of impedance for a series RLC circuit.",
        units: "Z = Ohms (Ω), R = Ohms (Ω), X_L, X_C = Ohms (Ω)",
        variables: [
            { sym: "R", label: "Resistance (Ω)", unit: "Ω" },
            { sym: "XL", label: "X_L (Ω)", unit: "Ω" },
            { sym: "XC", label: "X_C (Ω)", unit: "Ω" }
        ],
        calc: (vars) => {
            if (vars.R !== undefined && vars.XL !== undefined && vars.XC !== undefined)
                return { result: Math.sqrt(vars.R ** 2 + (vars.XL - vars.XC) ** 2), unit: "Ω", label: "Z" };
            return null;
        }
    },
    {
        id: "xl", name: "Inductive Reactance", category: "circuit",
        latex: "X_L = 2\\pi f L = \\omega L",
        description: "Opposition to AC current by an inductor.",
        units: "X_L = Ohms (Ω), f = Hertz (Hz), L = Henrys (H)",
        variables: [
            { sym: "f", label: "Frequency (Hz)", unit: "Hz" },
            { sym: "L", label: "Inductance (H)", unit: "H" }
        ],
        calc: (vars) => {
            if (vars.f && vars.L) return { result: 2 * Math.PI * vars.f * vars.L, unit: "Ω", label: "X_L" };
            return null;
        }
    },
    {
        id: "xc", name: "Capacitive Reactance", category: "circuit",
        latex: "X_C = \\frac{1}{2\\pi f C} = \\frac{1}{\\omega C}",
        description: "Opposition to AC current by a capacitor.",
        units: "X_C = Ohms (Ω), f = Hertz (Hz), C = Farads (F)",
        variables: [
            { sym: "f", label: "Frequency (Hz)", unit: "Hz" },
            { sym: "C", label: "Capacitance (F)", unit: "F" }
        ],
        calc: (vars) => {
            if (vars.f && vars.C) return { result: 1 / (2 * Math.PI * vars.f * vars.C), unit: "Ω", label: "X_C" };
            return null;
        }
    },
    {
        id: "rc-tau", name: "RC Time Constant", category: "circuit",
        latex: "\\tau = R \\cdot C",
        description: "Time constant of an RC circuit — time to reach 63.2% of final value.",
        units: "τ = Seconds (s), R = Ohms (Ω), C = Farads (F)",
        variables: [
            { sym: "R", label: "Resistance (Ω)", unit: "Ω" },
            { sym: "C", label: "Capacitance (F)", unit: "F" }
        ],
        calc: (vars) => {
            if (vars.R && vars.C) return { result: vars.R * vars.C, unit: "s", label: "τ" };
            return null;
        }
    },
    {
        id: "rl-tau", name: "RL Time Constant", category: "circuit",
        latex: "\\tau = \\frac{L}{R}",
        description: "Time constant of an RL circuit.",
        units: "τ = Seconds (s), L = Henrys (H), R = Ohms (Ω)",
        variables: [
            { sym: "L", label: "Inductance (H)", unit: "H" },
            { sym: "R", label: "Resistance (Ω)", unit: "Ω" }
        ],
        calc: (vars) => {
            if (vars.L && vars.R) return { result: vars.L / vars.R, unit: "s", label: "τ" };
            return null;
        }
    },
    {
        id: "resonance", name: "Resonant Frequency", category: "circuit",
        latex: "f_0 = \\frac{1}{2\\pi\\sqrt{LC}}",
        description: "Resonant frequency of an LC/RLC circuit.",
        units: "f₀ = Hertz (Hz), L = Henrys (H), C = Farads (F)",
        variables: [
            { sym: "L", label: "Inductance (H)", unit: "H" },
            { sym: "C", label: "Capacitance (F)", unit: "F" }
        ],
        calc: (vars) => {
            if (vars.L && vars.C) return { result: 1 / (2 * Math.PI * Math.sqrt(vars.L * vars.C)), unit: "Hz", label: "f₀" };
            return null;
        }
    },
    {
        id: "q-factor", name: "Quality Factor", category: "circuit",
        latex: "Q = \\frac{1}{R}\\sqrt{\\frac{L}{C}}",
        description: "Sharpness of resonance peak — ratio of energy stored to energy dissipated.",
        units: "Q = dimensionless"
    },
    {
        id: "vrms", name: "RMS Voltage", category: "circuit",
        latex: "V_{rms} = \\frac{V_m}{\\sqrt{2}}",
        description: "Root mean square voltage of a sinusoidal waveform.",
        units: "V_rms = Volts (V), V_m = Peak Voltage (V)",
        variables: [
            { sym: "Vm", label: "V_peak (V)", unit: "V" }
        ],
        calc: (vars) => {
            if (vars.Vm) return { result: vars.Vm / Math.sqrt(2), unit: "V", label: "V_rms" };
            return null;
        }
    },
    {
        id: "phase-angle", name: "Phase Angle", category: "circuit",
        latex: "\\phi = \\arctan\\left(\\frac{X_L - X_C}{R}\\right)",
        description: "Phase angle between voltage and current in an AC circuit.",
        units: "φ = Radians or Degrees"
    },
    {
        id: "rc-charge", name: "Capacitor Charging", category: "circuit",
        latex: "V(t) = V_0\\left(1 - e^{-t/\\tau}\\right)",
        description: "Voltage across a charging capacitor as a function of time.",
        units: "V = Volts, t = Seconds, τ = RC"
    },

    // ──── 2. Electrical Machines ────
    {
        id: "faraday", name: "Faraday's Law", category: "machines",
        latex: "\\mathcal{E} = -N\\frac{d\\Phi_B}{dt}",
        description: "Induced EMF equals negative rate of change of magnetic flux times number of turns.",
        units: "ε = Volts (V), N = turns, Φ_B = Webers (Wb)"
    },
    {
        id: "lenz", name: "Lenz's Law", category: "machines",
        latex: "\\mathcal{E}_{induced} = -\\frac{d\\Phi_B}{dt}",
        description: "The direction of induced EMF opposes the change in flux that produces it.",
        units: "ε = Volts (V), Φ_B = Webers (Wb)"
    },
    {
        id: "transformer", name: "Transformer Turns Ratio", category: "machines",
        latex: "\\frac{V_1}{V_2} = \\frac{N_1}{N_2} = \\frac{I_2}{I_1}",
        description: "Voltage ratio equals turns ratio equals inverse current ratio in an ideal transformer.",
        units: "V = Volts, N = turns, I = Amperes"
    },
    {
        id: "emf-gen", name: "Generator EMF", category: "machines",
        latex: "E = \\frac{P \\phi Z N}{60 A}",
        description: "EMF equation of a DC generator. P = poles, φ = flux/pole, Z = conductors, N = speed, A = parallel paths.",
        units: "E = Volts, φ = Wb, N = rpm"
    },
    {
        id: "sync-speed", name: "Synchronous Speed", category: "machines",
        latex: "N_s = \\frac{120 f}{P}",
        description: "Synchronous speed of AC machines. f = supply frequency, P = number of poles.",
        units: "N_s = rpm, f = Hz, P = poles",
        variables: [
            { sym: "f", label: "Frequency (Hz)", unit: "Hz" },
            { sym: "P", label: "No. of Poles", unit: "" }
        ],
        calc: (vars) => {
            if (vars.f && vars.P) return { result: (120 * vars.f) / vars.P, unit: "rpm", label: "N_s" };
            return null;
        }
    },
    {
        id: "slip", name: "Slip of Induction Motor", category: "machines",
        latex: "s = \\frac{N_s - N_r}{N_s}",
        description: "Difference between synchronous speed and rotor speed, expressed as a fraction.",
        units: "s = dimensionless, N_s = rpm, N_r = rpm",
        variables: [
            { sym: "Ns", label: "Sync Speed (rpm)", unit: "rpm" },
            { sym: "Nr", label: "Rotor Speed (rpm)", unit: "rpm" }
        ],
        calc: (vars) => {
            if (vars.Ns && vars.Nr) return { result: (vars.Ns - vars.Nr) / vars.Ns, unit: "", label: "Slip (s)" };
            return null;
        }
    },
    {
        id: "torque-motor", name: "Motor Torque", category: "machines",
        latex: "T = \\frac{P_{mech}}{\\omega} = \\frac{60 \\cdot P_{mech}}{2\\pi N}",
        description: "Mechanical torque developed by a motor.",
        units: "T = N·m, P = Watts, N = rpm"
    },
    {
        id: "mag-flux", name: "Magnetic Flux", category: "machines",
        latex: "\\Phi_B = B \\cdot A \\cdot \\cos\\theta",
        description: "Magnetic flux through a surface of area A in a uniform field B.",
        units: "Φ_B = Webers (Wb), B = Tesla (T), A = m²",
        variables: [
            { sym: "B", label: "Magnetic Field (T)", unit: "T" },
            { sym: "A", label: "Area (m²)", unit: "m²" },
            { sym: "theta", label: "Angle θ (°)", unit: "°" }
        ],
        calc: (vars) => {
            if (vars.B && vars.A && vars.theta !== undefined)
                return { result: vars.B * vars.A * Math.cos(vars.theta * Math.PI / 180), unit: "Wb", label: "Φ_B" };
            return null;
        }
    },
    {
        id: "mutual-ind", name: "Mutual Inductance", category: "machines",
        latex: "\\mathcal{E}_2 = -M\\frac{dI_1}{dt}",
        description: "EMF induced in coil 2 due to changing current in coil 1.",
        units: "M = Henrys (H)"
    },
    {
        id: "self-ind", name: "Self Inductance", category: "machines",
        latex: "V_L = L\\frac{dI}{dt}",
        description: "Voltage across an inductor due to changing current.",
        units: "V_L = Volts (V), L = Henrys (H)"
    },

    // ──── 3. Electrical Measurements ────
    {
        id: "wheat-bridge", name: "Wheatstone Bridge", category: "measurements",
        latex: "\\frac{R_1}{R_2} = \\frac{R_3}{R_4} \\quad (\\text{at balance})",
        description: "At balance, no current flows through galvanometer; used for precise resistance measurement.",
        units: "R = Ohms (Ω)"
    },
    {
        id: "gauss-e", name: "Gauss's Law (Electric)", category: "measurements",
        latex: "\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{enc}}{\\varepsilon_0}",
        description: "Electric flux through a closed surface equals enclosed charge divided by ε₀.",
        units: "E = V/m, Q = Coulombs (C), ε₀ = 8.854×10⁻¹² F/m"
    },
    {
        id: "gauss-b", name: "Gauss's Law (Magnetic)", category: "measurements",
        latex: "\\oint \\vec{B} \\cdot d\\vec{A} = 0",
        description: "Net magnetic flux through any closed surface is always zero — no magnetic monopoles.",
        units: "B = Tesla (T)"
    },
    {
        id: "faraday-max", name: "Faraday's Law (Maxwell)", category: "measurements",
        latex: "\\oint \\vec{E} \\cdot d\\vec{l} = -\\frac{d\\Phi_B}{dt}",
        description: "Circulation of electric field around a closed loop equals negative rate of change of magnetic flux.",
        units: "E = V/m, Φ_B = Wb"
    },
    {
        id: "ampere-max", name: "Ampère-Maxwell Law", category: "measurements",
        latex: "\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{enc} + \\mu_0\\varepsilon_0\\frac{d\\Phi_E}{dt}",
        description: "Magnetic field circulation equals enclosed current plus displacement current.",
        units: "B = T, μ₀ = 4π×10⁻⁷ H/m"
    },
    {
        id: "sensitivity", name: "Instrument Sensitivity", category: "measurements",
        latex: "S = \\frac{\\Delta \\theta}{\\Delta I}",
        description: "Deflection per unit change in measured quantity for a measuring instrument.",
        units: "S = div/A or mm/μA"
    },
    {
        id: "err-pct", name: "Percentage Error", category: "measurements",
        latex: "\\%\\text{Error} = \\frac{|\\text{Measured} - \\text{True}|}{\\text{True}} \\times 100",
        description: "Percentage deviation of measured value from the true value.",
        units: "% (percent)",
        variables: [
            { sym: "Measured", label: "Measured Value", unit: "" },
            { sym: "True", label: "True Value", unit: "" }
        ],
        calc: (vars) => {
            if (vars.Measured !== undefined && vars.True)
                return { result: Math.abs(vars.Measured - vars.True) / vars.True * 100, unit: "%", label: "% Error" };
            return null;
        }
    },

    // ──── 4. Power Systems ────
    {
        id: "3phase-p", name: "3-Phase Power", category: "power",
        latex: "P_{3\\phi} = \\sqrt{3}\\, V_L \\, I_L \\, \\cos\\phi",
        description: "Total active power in a balanced 3-phase system.",
        units: "P = Watts (W), V_L = Line Voltage (V), I_L = Line Current (A)"
    },
    {
        id: "pf", name: "Power Factor", category: "power",
        latex: "\\text{PF} = \\cos\\phi = \\frac{P}{S}",
        description: "Ratio of real power to apparent power.",
        units: "PF = dimensionless, P = W, S = VA",
        variables: [
            { sym: "P", label: "Real Power (W)", unit: "W" },
            { sym: "S", label: "Apparent Power (VA)", unit: "VA" }
        ],
        calc: (vars) => {
            if (vars.P && vars.S) return { result: vars.P / vars.S, unit: "", label: "Power Factor" };
            return null;
        }
    },
    {
        id: "apparent-power", name: "Apparent Power", category: "power",
        latex: "S = V_{rms} \\cdot I_{rms}",
        description: "Total power supplied to an AC circuit (VA).",
        units: "S = Volt-Amperes (VA)"
    },
    {
        id: "reactive-power", name: "Reactive Power", category: "power",
        latex: "Q = V \\cdot I \\cdot \\sin\\phi",
        description: "Power that oscillates between source and reactive components.",
        units: "Q = VAR (Volt-Ampere Reactive)"
    },
    {
        id: "efficiency", name: "Efficiency", category: "power",
        latex: "\\eta = \\frac{P_{out}}{P_{in}} \\times 100\\%",
        description: "Ratio of output power to input power expressed as a percentage.",
        units: "η = %, P = Watts (W)",
        variables: [
            { sym: "Pout", label: "P_out (W)", unit: "W" },
            { sym: "Pin", label: "P_in (W)", unit: "W" }
        ],
        calc: (vars) => {
            if (vars.Pout && vars.Pin) return { result: (vars.Pout / vars.Pin) * 100, unit: "%", label: "Efficiency" };
            return null;
        }
    },
    {
        id: "vr-pct", name: "Voltage Regulation", category: "power",
        latex: "\\%VR = \\frac{V_{NL} - V_{FL}}{V_{FL}} \\times 100",
        description: "Percentage change in terminal voltage from no-load to full-load.",
        units: "VR = %, V = Volts",
        variables: [
            { sym: "Vnl", label: "V_no-load (V)", unit: "V" },
            { sym: "Vfl", label: "V_full-load (V)", unit: "V" }
        ],
        calc: (vars) => {
            if (vars.Vnl && vars.Vfl) return { result: ((vars.Vnl - vars.Vfl) / vars.Vfl) * 100, unit: "%", label: "%VR" };
            return null;
        }
    },
    {
        id: "per-unit", name: "Per-Unit System", category: "power",
        latex: "Z_{pu} = \\frac{Z_{actual}}{Z_{base}}, \\quad Z_{base} = \\frac{V_{base}^2}{S_{base}}",
        description: "Normalization of power system quantities for simplified analysis.",
        units: "PU = dimensionless"
    },

    // ──── 5. Control Systems ────
    {
        id: "tf", name: "Transfer Function", category: "control",
        latex: "H(s) = \\frac{Y(s)}{X(s)} = \\frac{\\text{Output}}{\\text{Input}}",
        description: "Ratio of output to input in the Laplace domain for an LTI system.",
        units: "H(s) = dimensionless ratio"
    },
    {
        id: "cl-tf", name: "Closed-Loop TF", category: "control",
        latex: "T(s) = \\frac{G(s)}{1 + G(s)H(s)}",
        description: "Closed-loop transfer function with forward gain G and feedback H.",
        units: "Dimensionless"
    },
    {
        id: "char-eq", name: "Characteristic Equation", category: "control",
        latex: "1 + G(s)H(s) = 0",
        description: "Determines the poles of the closed-loop system; stability criterion.",
        units: "s = complex frequency"
    },
    {
        id: "bode-gain", name: "Bode Gain (dB)", category: "control",
        latex: "|H(j\\omega)|_{dB} = 20\\log_{10}|H(j\\omega)|",
        description: "Magnitude of frequency response expressed in decibels for Bode plots.",
        units: "dB = decibels"
    },
    {
        id: "routh", name: "Routh Stability Criterion", category: "control",
        latex: "\\text{All elements in 1st column of Routh array} > 0",
        description: "A system is stable if all first-column entries of the Routh array are positive.",
        units: "N/A"
    },
    {
        id: "sse", name: "Steady-State Error", category: "control",
        latex: "e_{ss} = \\lim_{s \\to 0} \\frac{s \\cdot R(s)}{1 + G(s)H(s)}",
        description: "Steady-state error for a unity feedback system using the Final Value Theorem.",
        units: "Depends on input type"
    },

    // ──── 6. Electronics ────
    {
        id: "diode-eq", name: "Shockley Diode Equation", category: "electronics",
        latex: "I_D = I_S\\left(e^{V_D / nV_T} - 1\\right)",
        description: "Diode current as a function of voltage; I_S is saturation current, V_T ≈ 26mV at room temp.",
        units: "I_D = Amperes (A), V_D = Volts (V), V_T = Thermal Voltage"
    },
    {
        id: "bjt-ic", name: "BJT Collector Current", category: "electronics",
        latex: "I_C = \\beta \\cdot I_B",
        description: "Collector current equals current gain (β) times base current.",
        units: "I_C = Amperes (A), β = dimensionless, I_B = Amperes (A)",
        variables: [
            { sym: "beta", label: "β (Current Gain)", unit: "" },
            { sym: "IB", label: "I_B (A)", unit: "A" }
        ],
        calc: (vars) => {
            if (vars.beta && vars.IB) return { result: vars.beta * vars.IB, unit: "A", label: "I_C" };
            return null;
        }
    },
    {
        id: "mosfet-id", name: "MOSFET Drain Current (Sat.)", category: "electronics",
        latex: "I_D = \\frac{1}{2}\\mu_n C_{ox}\\frac{W}{L}(V_{GS} - V_{th})^2",
        description: "Drain current in saturation region of an NMOS transistor.",
        units: "I_D = Amperes, μₙ = cm²/V·s, C_ox = F/cm²"
    },
    {
        id: "thermal-v", name: "Thermal Voltage", category: "electronics",
        latex: "V_T = \\frac{kT}{q} \\approx 26\\text{mV at 300K}",
        description: "Thermal voltage at room temperature, fundamental to semiconductor physics.",
        units: "V_T = Volts, k = 1.38×10⁻²³ J/K, q = 1.6×10⁻¹⁹ C"
    },
    {
        id: "inv-amp", name: "Inverting Amplifier", category: "electronics",
        latex: "A_v = -\\frac{R_f}{R_{in}}",
        description: "Voltage gain of an inverting op-amp configuration.",
        units: "A_v = dimensionless, R = Ohms (Ω)",
        variables: [
            { sym: "Rf", label: "R_f (Ω)", unit: "Ω" },
            { sym: "Rin", label: "R_in (Ω)", unit: "Ω" }
        ],
        calc: (vars) => {
            if (vars.Rf && vars.Rin) return { result: -(vars.Rf / vars.Rin), unit: "", label: "Gain (A_v)" };
            return null;
        }
    },
    {
        id: "noninv-amp", name: "Non-Inverting Amplifier", category: "electronics",
        latex: "A_v = 1 + \\frac{R_f}{R_{in}}",
        description: "Voltage gain of a non-inverting op-amp configuration.",
        units: "A_v = dimensionless, R = Ohms (Ω)",
        variables: [
            { sym: "Rf", label: "R_f (Ω)", unit: "Ω" },
            { sym: "Rin", label: "R_in (Ω)", unit: "Ω" }
        ],
        calc: (vars) => {
            if (vars.Rf && vars.Rin) return { result: 1 + (vars.Rf / vars.Rin), unit: "", label: "Gain (A_v)" };
            return null;
        }
    },
    {
        id: "sum-amp", name: "Summing Amplifier", category: "electronics",
        latex: "V_{out} = -R_f\\left(\\frac{V_1}{R_1} + \\frac{V_2}{R_2} + \\cdots\\right)",
        description: "Output is weighted sum of input voltages (inverting).",
        units: "V = Volts, R = Ohms"
    },
    {
        id: "diff-amp", name: "Differentiator", category: "electronics",
        latex: "V_{out} = -R_f C \\frac{dV_{in}}{dt}",
        description: "Output is proportional to the rate of change of input.",
        units: "V = Volts, R = Ohms, C = Farads"
    },
    {
        id: "integrator", name: "Integrator", category: "electronics",
        latex: "V_{out} = -\\frac{1}{R C}\\int V_{in}\\, dt",
        description: "Output is proportional to the integral of input voltage.",
        units: "V = Volts, R = Ohms, C = Farads"
    },

    // ──── 7. Signals and Systems ────
    {
        id: "laplace-def", name: "Laplace Transform", category: "signals",
        latex: "F(s) = \\mathcal{L}\\{f(t)\\} = \\int_0^{\\infty} f(t)\\, e^{-st}\\, dt",
        description: "Converts a time-domain function into the complex frequency domain.",
        units: "s = complex frequency (rad/s)"
    },
    {
        id: "inv-laplace", name: "Inverse Laplace", category: "signals",
        latex: "f(t) = \\mathcal{L}^{-1}\\{F(s)\\}",
        description: "Recovers the time-domain function from its Laplace transform.",
        units: "s = complex frequency"
    },
    {
        id: "fourier-def", name: "Fourier Transform", category: "signals",
        latex: "F(\\omega) = \\int_{-\\infty}^{\\infty} f(t)\\, e^{-j\\omega t}\\, dt",
        description: "Decomposes a time-domain signal into its frequency components.",
        units: "ω = Angular Frequency (rad/s)"
    },
    {
        id: "laplace-exp", name: "Laplace of Exponential", category: "signals",
        latex: "\\mathcal{L}\\{e^{-at}\\} = \\frac{1}{s+a}",
        description: "Common Laplace transform pair: exponential decay.",
        units: "a = decay constant (1/s)"
    },
    {
        id: "laplace-sin", name: "Laplace of Sine", category: "signals",
        latex: "\\mathcal{L}\\{\\sin(\\omega t)\\} = \\frac{\\omega}{s^2 + \\omega^2}",
        description: "Laplace transform of sine function.",
        units: "ω = Angular Frequency (rad/s)"
    },
    {
        id: "convolution", name: "Convolution Theorem", category: "signals",
        latex: "\\mathcal{L}\\{f * g\\} = F(s) \\cdot G(s)",
        description: "Convolution in time domain equals multiplication in frequency domain.",
        units: "Dimensionless"
    },

    // ──── 8. Microprocessor and Microcontroller ────
    {
        id: "demorgan1", name: "De Morgan's Theorem I", category: "micro",
        latex: "\\overline{A \\cdot B} = \\bar{A} + \\bar{B}",
        description: "Complement of AND equals OR of complements.",
        units: "Boolean values (0, 1)"
    },
    {
        id: "demorgan2", name: "De Morgan's Theorem II", category: "micro",
        latex: "\\overline{A + B} = \\bar{A} \\cdot \\bar{B}",
        description: "Complement of OR equals AND of complements.",
        units: "Boolean values (0, 1)"
    },
    {
        id: "bool-dist", name: "Distributive Law", category: "micro",
        latex: "A \\cdot (B + C) = A\\cdot B + A\\cdot C",
        description: "AND distributes over OR in Boolean algebra.",
        units: "Boolean"
    },
    {
        id: "bool-absorb", name: "Absorption Law", category: "micro",
        latex: "A + A\\cdot B = A",
        description: "Simplification rule — a variable absorbs the ANDed term.",
        units: "Boolean"
    },
    {
        id: "xor", name: "XOR Gate", category: "micro",
        latex: "Y = A \\oplus B = A\\bar{B} + \\bar{A}B",
        description: "Exclusive OR — output is high when inputs differ.",
        units: "Boolean"
    },
    {
        id: "sop", name: "Sum of Products (SOP)", category: "micro",
        latex: "F = \\sum m(\\text{minterms})",
        description: "Canonical form: function expressed as OR of AND terms (minterms).",
        units: "Boolean"
    },
    {
        id: "addr-lines", name: "Memory Address Lines", category: "micro",
        latex: "\\text{Memory Size} = 2^n \\text{ locations}",
        description: "Number of addressable memory locations with n address lines.",
        units: "n = number of address lines",
        variables: [
            { sym: "n", label: "Address Lines", unit: "" }
        ],
        calc: (vars) => {
            if (vars.n) return { result: Math.pow(2, vars.n), unit: "locations", label: "Memory Size" };
            return null;
        }
    },
    {
        id: "baud-rate", name: "Baud Rate", category: "micro",
        latex: "\\text{Baud Rate} = \\frac{f_{osc}}{12 \\times 32 \\times (256 - TH1)}",
        description: "Serial communication baud rate for 8051 microcontroller using Timer 1.",
        units: "Baud = bits/s"
    },

    // ──── 9. Electrical Estimation and Costing ────
    {
        id: "energy", name: "Electrical Energy", category: "estimation",
        latex: "E = P \\cdot t",
        description: "Energy consumed equals power multiplied by time.",
        units: "E = Joules (J) or kWh, P = Watts (W), t = Seconds (s) or hours",
        variables: [
            { sym: "P", label: "Power (W)", unit: "W" },
            { sym: "t", label: "Time (s)", unit: "s" }
        ],
        calc: (vars) => {
            if (vars.P && vars.t) return { result: vars.P * vars.t, unit: "J", label: "Energy" };
            return null;
        }
    },
    {
        id: "kwh", name: "Energy in kWh (Unit)", category: "estimation",
        latex: "\\text{kWh} = \\frac{P (\\text{W}) \\times t (\\text{hr})}{1000}",
        description: "One kWh (unit) = 1000 watts consumed for 1 hour. Basis of electricity billing.",
        units: "1 kWh = 1 Unit",
        variables: [
            { sym: "P", label: "Power (W)", unit: "W" },
            { sym: "t", label: "Time (hours)", unit: "hr" }
        ],
        calc: (vars) => {
            if (vars.P && vars.t) return { result: (vars.P * vars.t) / 1000, unit: "kWh", label: "Energy" };
            return null;
        }
    },
    {
        id: "demand-factor", name: "Demand Factor", category: "estimation",
        latex: "\\text{DF} = \\frac{\\text{Maximum Demand}}{\\text{Total Connected Load}}",
        description: "Ratio of maximum demand to total connected load of an installation.",
        units: "DF = dimensionless (< 1)"
    },
    {
        id: "diversity-fac", name: "Diversity Factor", category: "estimation",
        latex: "\\text{Diversity Factor} = \\frac{\\sum \\text{Individual Max Demands}}{\\text{Simultaneous Max Demand}}",
        description: "Ratio of sum of individual maximum demands to the combined maximum demand.",
        units: "Diversity Factor ≥ 1"
    },
    {
        id: "load-factor", name: "Load Factor", category: "estimation",
        latex: "\\text{LF} = \\frac{\\text{Average Load}}{\\text{Maximum Demand}}",
        description: "Ratio of average load to peak load over a period; indicates load utilization.",
        units: "LF = dimensionless (0 to 1)"
    },
    {
        id: "cable-size", name: "Cable Current Capacity", category: "estimation",
        latex: "I = \\frac{P}{V \\cdot \\cos\\phi} \\quad (\\text{1-phase})",
        description: "Current-carrying capacity needed for cable sizing in single-phase loads.",
        units: "I = Amperes, P = Watts, V = Volts",
        variables: [
            { sym: "P", label: "Power (W)", unit: "W" },
            { sym: "V", label: "Voltage (V)", unit: "V" },
            { sym: "cosphi", label: "Power Factor", unit: "" }
        ],
        calc: (vars) => {
            if (vars.P && vars.V && vars.cosphi) return { result: vars.P / (vars.V * vars.cosphi), unit: "A", label: "Current" };
            return null;
        }
    },
    {
        id: "elec-bill", name: "Electricity Bill", category: "estimation",
        latex: "\\text{Bill} = \\text{Units (kWh)} \\times \\text{Rate (₹/kWh)}",
        description: "Total electricity cost = energy consumed in kWh × tariff rate per unit.",
        units: "Bill = ₹, kWh = units"
    }
];

/* Category metadata */
const CATEGORIES = {
    circuit: { name: "Circuit Theory", icon: "⚡", color: "var(--cat-circuit)" },
    machines: { name: "Electrical Machines", icon: "⚙️", color: "var(--cat-machines)" },
    measurements: { name: "Electrical Measurements", icon: "📐", color: "var(--cat-measurements)" },
    power: { name: "Power Systems", icon: "🏭", color: "var(--cat-power)" },
    control: { name: "Control Systems", icon: "🎛️", color: "var(--cat-control)" },
    electronics: { name: "Electronics", icon: "🔬", color: "var(--cat-electronics)" },
    signals: { name: "Signals and Systems", icon: "〰️", color: "var(--cat-signals)" },
    micro: { name: "Microprocessor & Microcontroller", icon: "💻", color: "var(--cat-micro)" },
    estimation: { name: "Electrical Estimation & Costing", icon: "📊", color: "var(--cat-estimation)" }
};
