const fs = require('fs');
let file = fs.readFileSync('src/components/sections/ConferenceRegisterForm.tsx', 'utf8');

file = file.replace('text-center max-w-lg mx-auto', 'max-w-lg mx-auto');
file = file.replace('mx-auto mb-8 grid', 'mb-8 grid');
file = file.replace('max-w-7xl px-4 sm:px-6 pt-12 pb-20 text-center', 'max-w-7xl px-4 sm:px-6 pt-12 pb-20');
file = file.replace('chip mx-auto', 'chip mb-6');
file = file.replace('max-w-xl mx-auto', 'max-w-xl');
file = file.replace('mt-6 text-center', 'mt-6');

fs.writeFileSync('src/components/sections/ConferenceRegisterForm.tsx', file);
