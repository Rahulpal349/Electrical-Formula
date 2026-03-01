html_content = """
      <!-- MODULE 2: Semiconductor Fundamentals -->
      <section id="mod2" class="module-section">
        <div class="module-header" data-aos="fade-right">
          <h2 class="module-title">MODULE 2 <span class="module-subtitle">— Semiconductor Fundamentals</span></h2>
          <div class="module-line" style="background: var(--mod2-color); box-shadow: 0 0 10px var(--mod2-color);"></div>
        </div>

        <div class="card-grid">
          <!-- Card 2.1: Energy Bandgap -->
          <div class="machine-card" data-aos="fade-up">
            <div class="card-strip" style="background: var(--mod2-color)"></div>
            <div class="card-header">
              <h3>2.1 Energy Bandgap</h3>
            </div>
            <div class="formula-zone">
              <div class="formula text-sm">$$ E_g = E_c - E_v $$</div>
              <div style="font-size: 0.85rem; color: #94a3b8; margin: 10px 0;">
                $E_c$ = Cond. band, $E_v$ = Val. band
              </div>
              
              <div class="table-container" style="overflow-x: auto; margin-top:10px;">
                <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 0.85rem; color: #e2e8f0;">
                  <thead>
                    <tr style="border-bottom: 2px solid var(--mod2-color); color: var(--mod2-color);">
                      <th style="padding: 6px">Material</th>
                      <th style="padding: 6px">Ge</th>
                      <th style="padding: 6px">Si</th>
                      <th style="padding: 6px">GaAs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                      <td style="padding: 6px; font-weight: bold">$E_{g0K}$</td>
                      <td style="padding: 6px">0.785 eV</td>
                      <td style="padding: 6px">1.21 eV</td>
                      <td style="padding: 6px">1.52 eV</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px; font-weight: bold">$E_{g300K}$</td>
                      <td style="padding: 6px">0.72 eV</td>
                      <td style="padding: 6px">1.1 eV</td>
                      <td style="padding: 6px">1.42 eV</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="anim-zone" style="height: 200px; flex-direction:column; gap:10px;">
              <svg id="bandgap-svg" viewBox="0 0 300 150" width="100%" height="150" style="overflow:visible;">
                <!-- Conductor -->
                <rect x="20" y="20" width="60" height="60" fill="var(--mod3-color)" opacity="0.6"/>
                <rect x="20" y="60" width="60" height="60" fill="var(--mod4-color)" opacity="0.6"/>
                <text x="50" y="140" fill="#fff" font-size="12" text-anchor="middle">Conductor</text>
                
                <!-- Semiconductor -->
                <rect x="120" y="20" width="60" height="40" fill="var(--mod3-color)" opacity="0.8"/>
                <rect x="120" y="80" width="60" height="40" fill="var(--mod4-color)" opacity="0.8"/>
                <text x="150" y="70" fill="var(--mod1-color)" font-size="10" text-anchor="middle">Eg < 5eV</text>
                <text x="150" y="140" fill="#fff" font-size="12" text-anchor="middle">Semiconductor</text>

                <!-- Insulator -->
                <rect x="220" y="20" width="60" height="30" fill="var(--mod3-color)" opacity="0.8"/>
                <rect x="220" y="90" width="60" height="30" fill="var(--mod4-color)" opacity="0.8"/>
                <rect x="220" y="50" width="60" height="40" fill="var(--mod2-color)" opacity="0.3"/>
                <text x="250" y="70" fill="var(--mod2-color)" font-size="10" text-anchor="middle">Eg > 5eV</text>
                <text x="250" y="140" fill="#fff" font-size="12" text-anchor="middle">Insulator</text>
              </svg>
            </div>
          </div>

          <!-- Card 2.2: Fermi Level -->
          <div class="machine-card" data-aos="fade-up" data-aos-delay="100">
            <div class="card-strip" style="background: var(--mod2-color)"></div>
            <div class="card-header">
              <h3>2.2 Fermi Level</h3>
            </div>
            <div class="formula-zone">
              <div class="formula text-sm">$$ F(E) = \\frac{1}{1 + e^{(E - E_F)/KT}} $$</div>
              
              <div class="formula text-sm mt-2" id="fermi-eq-display">$$ E_F = \\frac{E_c + E_v}{2} - \\frac{KT}{2}\\ln\\left(\\frac{N_c}{N_v}\\right) $$</div>
              <div class="toggle-group mt-3" style="display:flex; justify-content:center; gap:10px;">
                <button class="toggle-btn active" id="btn-intrinsic">Intrinsic</button>
                <button class="toggle-btn" id="btn-ntype">N-Type</button>
                <button class="toggle-btn" id="btn-ptype">P-Type</button>
              </div>
            </div>
            <div class="anim-zone" style="height: 180px; position:relative;">
              <svg id="fermi-svg" viewBox="0 0 200 150" width="100%" height="100%">
                <!-- Bands -->
                <rect x="20" y="20" width="160" height="30" fill="var(--mod3-color)" opacity="0.5"/>
                <rect x="20" y="100" width="160" height="30" fill="var(--mod4-color)" opacity="0.5"/>
                <text x="100" y="40" fill="#fff" font-size="10" text-anchor="middle">Conduction Band (Ec)</text>
                <text x="100" y="120" fill="#fff" font-size="10" text-anchor="middle">Valence Band (Ev)</text>
                
                <!-- Fermi Level Line -->
                <line id="fermi-line" x1="20" y1="75" x2="180" y2="75" stroke="var(--mod1-color)" stroke-dasharray="4" stroke-width="2" class="glow-effect" style="transition: all 0.5s ease;"/>
                <text id="fermi-text" x="100" y="70" fill="var(--mod1-color)" font-size="10" text-anchor="middle" style="transition: all 0.5s ease;">EF (Intrinsic)</text>
              </svg>
            </div>
          </div>

          <!-- Card 2.3: Doping -->
          <div class="machine-card" style="grid-column: 1 / -1" data-aos="fade-up">
            <div class="card-strip" style="background: var(--mod2-color)"></div>
            <div class="card-header">
              <h3>2.3 Doping & Conductivity</h3>
            </div>
            <div class="formula-zone" style="display:flex; flex-wrap:wrap; gap:20px;">
              <div style="flex:1;">
                <div class="formula text-sm">$$ N_D + p = N_A + n \\quad \\text{(Neutrality)} $$</div>
                <ul style="color:#94a3b8; font-size:0.85rem; padding-left:20px; margin-top:10px;">
                  <li><strong>Heavy doping</strong> (1:$10^3$) → $N^+, P^+$</li>
                  <li><strong>Moderate</strong> (1:$10^6$) → $N, P$</li>
                  <li><strong>Light</strong> (1:$10^{11}$) → $N^-, P^-$</li>
                </ul>
                <div class="interactive-slider-group" style="margin-top:20px;">
                    <label style="min-width:60px;">Ratio 1:</label>
                    <input type="range" id="doping-slider" min="3" max="11" value="8" step="1">
                </div>
                <div id="doping-disp" class="text-xs text-center mt-2" style="color:var(--mod2-color);font-family:'Orbitron',sans-serif;">Moderate Doping | 10^8</div>
              </div>
              <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                <!-- Doping Lattice SVG -->
                <div class="anim-zone" style="height:200px; padding:0; border:none;">
                  <svg viewBox="0 0 200 200" width="100%" height="100%" id="lattice-svg" style="max-height:180px;">
                    <!-- Bonds will be rendered via JS -->
                  </svg>
                </div>
                <div class="toggle-group mt-2" style="display:flex; justify-content:center; gap:10px;">
                  <button class="toggle-btn" id="btn-lattice-p">P-Type (Boron)</button>
                  <button class="toggle-btn active" id="btn-lattice-i">Intrinsic (Si)</button>
                  <button class="toggle-btn" id="btn-lattice-n">N-Type (Phos)</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2.4: Mass Action Law -->
          <div class="machine-card" data-aos="fade-up">
            <div class="card-strip" style="background: var(--mod2-color)"></div>
            <div class="card-header">
              <h3>2.4 Mass Action Law</h3>
            </div>
            <div class="formula-zone">
              <div class="formula text-sm mb-3">$$ n \\cdot p = n_i^2 $$</div>
              <div class="formula text-sm mb-3">$$ n_i = \\sqrt{A_0} T^{3/2} e^{-E_g/2KT} $$</div>
              <div class="formula text-sm">$$ \\text{Minority} = \\frac{n_i^2}{\\text{Majority}} $$</div>
            </div>
            <div class="anim-zone" style="height: 120px; text-align:center;">
               <div style="color: #e2e8f0; font-size:0.9rem;">
                  Intrinsic Concentration at 300K:<br><br>
                  <span style="color:var(--mod3-color); font-weight:bold;">Si: $1.5 \\times 10^{10} \\text{ cm}^{-3}$</span><br>
                  <span style="color:var(--mod4-color); font-weight:bold;">Ge: $2.5 \\times 10^{13} \\text{ cm}^{-3}$</span>
               </div>
            </div>
          </div>

          <!-- Card 2.5: Thermal Voltage & Einstein Relation -->
          <div class="machine-card" data-aos="fade-up" data-aos-delay="100">
            <div class="card-strip" style="background: var(--mod2-color)"></div>
            <div class="card-header">
              <h3>2.5 Thermal Voltage (VT)</h3>
            </div>
            <div class="formula-zone">
              <div class="formula text-sm mb-3">$$ V_T = \\frac{KT}{q} = \\frac{T}{11600} $$</div>
              <div class="formula text-sm">$$ \\frac{D_n}{\\mu_n} = \\frac{D_p}{\\mu_p} = V_T $$</div>
            </div>
            <div class="anim-zone" style="height: 120px; flex-direction:column;">
               <div class="interactive-slider-group" style="width:80%; margin-top:0;">
                    <label style="min-width:60px;">Temp(K):</label>
                    <input type="range" id="temp-vt-slider" min="200" max="400" value="300" step="10">
               </div>
               <div id="vt-display" class="orbitron mt-3" style="font-size:1.5rem; color:var(--mod1-color); text-shadow:0 0 8px currentColor;">
                  V<sub>T</sub> = 25.86 mV
               </div>
            </div>
          </div>

          <!-- Card 2.6: Drift & Diffusion -->
          <div class="machine-card" style="grid-column: 1 / -1" data-aos="fade-up">
            <div class="card-strip" style="background: var(--mod2-color)"></div>
            <div class="card-header">
              <h3>2.6 Drift & Diffusion Currents</h3>
            </div>
            <div class="formula-zone" style="display:flex; flex-wrap:wrap; gap:20px;">
              <div style="flex:1;">
                <h4 style="color:#fff; margin-bottom:10px; text-align:center;">Drift (Electric Field)</h4>
                <div class="formula text-sm mb-2">$$ J_n(\\text{drift}) = nq\\mu_n E $$</div>
                <div class="formula text-sm mt-2">$$ J_p(\\text{drift}) = pq\\mu_p E $$</div>
              </div>
              <div style="flex:1;">
                <h4 style="color:#fff; margin-bottom:10px; text-align:center;">Diffusion (Gradient)</h4>
                <div class="formula text-sm mb-2">$$ J_n(\\text{diff}) = +qD_n\\frac{dn}{dx} $$</div>
                <div class="formula text-sm mt-2">$$ J_p(\\text{diff}) = -qD_p\\frac{dp}{dx} $$</div>
              </div>
            </div>
            <div class="anim-zone" style="height: 150px; flex-direction:row; justify-content:space-around; align-items:center;">
               <!-- Drift Anim -->
               <div id="drift-anim" style="width:40%; height:80px; position:relative; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(255,255,255,0.1); overflow:hidden;">
                  <div style="position:absolute; top:2px; left:5px; font-size:0.7rem; color:#94a3b8; z-index:2;">E Field ➔</div>
                  <!-- Particles injected via JS -->
               </div>
               <div style="color:#e2e8f0; font-size:1.5rem; font-family:'Orbitron',sans-serif; font-weight:bold;">vs</div>
               <!-- Diff Anim -->
               <div id="diff-anim" style="width:40%; height:80px; position:relative; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(255,255,255,0.1); overflow:hidden;">
                  <div style="position:absolute; top:2px; right:5px; font-size:0.7rem; color:#94a3b8; z-index:2;">High ➔ Low</div>
                  <div style="position:absolute; top:0; left:0; width:60%; height:100%; background:linear-gradient(90deg, rgba(167,139,250,0.3) 0%, transparent 100%);"></div>
                  <!-- Particles injected via JS -->
               </div>
            </div>
          </div>
          
          <!-- Card 2.7 & 2.8: Mobility and Hall Effect -->
          <div class="machine-card" style="grid-column:1 / 2;" data-aos="fade-up">
            <div class="card-strip" style="background: var(--mod2-color)"></div>
            <div class="card-header">
              <h3>2.7 Mobility (μ)</h3>
            </div>
            <div class="formula-zone">
              <div class="formula text-sm mb-3">$$ \\mu = \\frac{v_d}{E} \\quad [m^2/V\\cdot s] $$</div>
              <div class="formula text-sm">$$ \\mu \\propto T^{-m} $$</div>
              <div class="text-xs mt-3" style="color:#94a3b8; line-height:1.5;">
                <strong>e⁻ mobility (cm²/Vs):</strong><br> Ge: 3800 | Si: 1300 | GaAs: 8500
              </div>
            </div>
          </div>

          <!-- Card 2.8 Hall Effect -->
          <div class="machine-card" data-aos="fade-up" data-aos-delay="100">
            <div class="card-strip" style="background: var(--mod2-color)"></div>
            <div class="card-header">
              <h3>2.8 Hall Effect</h3>
            </div>
            <div class="formula-zone">
              <div class="formula text-sm mb-3">$$ V_H = \\frac{BI}{\\rho W} = R_H \\frac{BI}{W} $$</div>
              <div class="formula text-sm">$$ R_H = \\frac{1}{nq} \\text{ (n-type)} $$</div>
            </div>
            <div class="anim-zone" style="height: 150px; position:relative;">
                <svg viewBox="0 0 200 120" width="100%" height="100%">
                    <!-- 3D Slab approx -->
                    <polygon points="50,90 150,90 170,60 70,60" fill="rgba(0, 245, 255, 0.2)" stroke="var(--mod3-color)" stroke-width="1"/>
                    <polygon points="50,90 50,110 150,110 150,90" fill="rgba(0, 245, 255, 0.4)" stroke="var(--mod3-color)" stroke-width="1"/>
                    <polygon points="150,90 150,110 170,80 170,60" fill="rgba(0, 245, 255, 0.3)" stroke="var(--mod3-color)" stroke-width="1"/>
                    
                    <!-- B Field (Z axis) -->
                    <g id="hall-bfield" stroke="var(--mod1-color)" fill="none" class="glow-effect" stroke-width="2">
                        <line x1="110" y1="20" x2="110" y2="70" marker-end="url(#hall-arrow)"/>
                        <text x="115" y="30" font-size="12" fill="var(--mod1-color)" stroke="none">B</text>
                    </g>
                    <!-- I (X axis) -->
                    <g id="hall-ifield" stroke="var(--mod2-color)" fill="none" class="glow-effect" stroke-width="2">
                        <line x1="10" y1="100" x2="50" y2="100" marker-end="url(#hall-arrow-red)"/>
                        <text x="20" y="115" font-size="12" fill="var(--mod2-color)" stroke="none">I</text>
                    </g>
                    <!-- VH (Y axis) -->
                    <text x="90" y="105" fill="#fff" font-size="10">+ VH -</text>
                    
                    <defs>
                        <marker id="hall-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="var(--mod1-color)" />
                        </marker>
                        <marker id="hall-arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="var(--mod2-color)" />
                        </marker>
                    </defs>
                </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- Placeholder for MOD 3-6 -->
"""

with open('electronics.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('<!-- Placeholder for MOD 2-6 -->', html_content)

with open('electronics.html', 'w', encoding='utf-8') as f:
    f.write(text)
