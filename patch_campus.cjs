const fs = require('fs');
let file = fs.readFileSync('src/components/sections/CampusRegisterForm.tsx', 'utf8');

file = file.replace('phone: string;', 'phone: string;\n  whatsapp: string;');
file = file.replace('phone: "",', 'phone: "",\n  whatsapp: "",');
file = file.replace('if (!formData.phone.trim()) newErrors.phone = "Phone number is required";', 'if (!formData.phone.trim()) newErrors.phone = "Phone number is required";\n      if (!formData.whatsapp.trim()) newErrors.whatsapp = "WhatsApp number is required";');

file = file.replace('const [submitSuccess, setSubmitSuccess] = useState(false);', 'const [submitSuccess, setSubmitSuccess] = useState(false);\n  const [sameAsPhone, setSameAsPhone] = useState(false);');

const oldPhoneInput = `                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-muted block mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-purple-glow"
                    placeholder="e.g. +234..."
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>`;

const newPhoneInput = `                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-foreground-muted block mb-2">
                    Calling Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (sameAsPhone) {
                        setFormData((prev) => ({ ...prev, whatsapp: e.target.value }));
                      }
                    }}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-purple-glow"
                    placeholder="e.g. +234..."
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-muted block mb-2">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (sameAsPhone) setSameAsPhone(false);
                    }}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-purple-glow"
                    placeholder="e.g. +234..."
                  />
                  {errors.whatsapp && <p className="text-red-400 text-xs mt-1">{errors.whatsapp}</p>}
                  <label className="mt-3 flex items-center gap-2 cursor-pointer text-sm text-foreground-muted hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSameAsPhone(checked);
                        if (checked) {
                          setFormData((prev) => ({ ...prev, whatsapp: prev.phone }));
                        }
                      }}
                      className="rounded border-white/20 bg-transparent text-purple focus:ring-purple/50 focus:ring-offset-0 h-4 w-4"
                    />
                    Same as calling number
                  </label>
                </div>
              </div>`;

file = file.replace(oldPhoneInput, newPhoneInput);

fs.writeFileSync('src/components/sections/CampusRegisterForm.tsx', file);
