const fs = require('fs');
let file = fs.readFileSync('src/components/sections/ConferenceRegisterForm.tsx', 'utf8');

file = file.replace('phone: string;', 'phone: string;\n  whatsapp: string;');
file = file.replace('phone: "",', 'phone: "",\n  whatsapp: "",');
file = file.replace('if (!formData.phone.trim()) newErrors.phone = "Phone number is required";', 'if (!formData.phone.trim()) newErrors.phone = "Phone number is required";\n    if (!formData.whatsapp.trim()) newErrors.whatsapp = "WhatsApp number is required";');

// the checkbox state
file = file.replace('const [submitSuccess, setSubmitSuccess] = useState(false);', 'const [submitSuccess, setSubmitSuccess] = useState(false);\n  const [sameAsPhone, setSameAsPhone] = useState(false);');

// the phone input
const phoneInputStr = `              {/* Phone */}
              <div>
                <FieldLabel required>Phone Number / WhatsApp Number</FieldLabel>
                <TextInput
                  name="phone"
                  value={formData.phone}
                  onChange={handleInput}
                  placeholder="Type out an accurate number"
                  type="tel"
                  error={errors.phone}
                />
              </div>`;

const newPhoneInput = `              {/* Phone & WhatsApp */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>Calling Phone Number</FieldLabel>
                  <TextInput
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      handleInput(e);
                      if (sameAsPhone) {
                        setFormData((prev) => ({ ...prev, whatsapp: e.target.value }));
                      }
                    }}
                    placeholder="e.g. +234..."
                    type="tel"
                    error={errors.phone}
                  />
                </div>
                <div>
                  <FieldLabel required>WhatsApp Number</FieldLabel>
                  <TextInput
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => {
                      handleInput(e);
                      if (sameAsPhone) setSameAsPhone(false);
                    }}
                    placeholder="e.g. +234..."
                    type="tel"
                    error={errors.whatsapp}
                  />
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

file = file.replace(phoneInputStr, newPhoneInput);

fs.writeFileSync('src/components/sections/ConferenceRegisterForm.tsx', file);
