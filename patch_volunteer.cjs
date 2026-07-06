const fs = require('fs');
let file = fs.readFileSync('src/components/sections/VolunteerApplicationForm.tsx', 'utf8');

file = file.replace('const [submitSuccess, setSubmitSuccess] = useState(false);', 'const [submitSuccess, setSubmitSuccess] = useState(false);\n  const [sameAsPhone, setSameAsPhone] = useState(false);');

const oldPhoneInputs = `                    <div>
                      <FieldLabel required>Phone Number</FieldLabel>
                      <TextInput
                        name="phone"
                        value={formData.phone}
                        onChange={handleInput}
                        type="tel"
                        placeholder="Your phone number"
                        error={errors.phone}
                      />
                    </div>
                    <div>
                      <FieldLabel required>WhatsApp Number</FieldLabel>
                      <TextInput
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInput}
                        type="tel"
                        placeholder="Your WhatsApp number"
                        error={errors.whatsapp}
                      />
                    </div>`;

const newPhoneInputs = `                    <div>
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
                        type="tel"
                        placeholder="Your phone number"
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
                        type="tel"
                        placeholder="Your WhatsApp number"
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
                    </div>`;

file = file.replace(oldPhoneInputs, newPhoneInputs);

fs.writeFileSync('src/components/sections/VolunteerApplicationForm.tsx', file);
