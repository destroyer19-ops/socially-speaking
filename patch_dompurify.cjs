const fs = require('fs');

let file = fs.readFileSync('src/routes/blog.$slug.tsx', 'utf8');

if (!file.includes('DOMPurify')) {
    file = file.replace(
        'import { Calendar, ArrowLeft } from "lucide-react";',
        'import { Calendar, ArrowLeft } from "lucide-react";\nimport DOMPurify from "dompurify";'
    );
    file = file.replace(
        'dangerouslySetInnerHTML={{ __html: post.body }}',
        'dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.body) }}'
    );
    fs.writeFileSync('src/routes/blog.$slug.tsx', file);
}
