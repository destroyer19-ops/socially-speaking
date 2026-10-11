import os
from PIL import Image

path = 'PHOTO-2026-09-28-20-38-49.jpg'
out_path = 'src/assets/ssc2026-ecard.webp'

with Image.open(path) as img:
    orig_size = os.path.getsize(path)
    print(f"Original:")
    print(f"- Dimensions: {img.width}x{img.height}")
    print(f"- File size: {orig_size} bytes")
    print(f"- Format: {img.format}")

    # Convert to RGB if necessary for WebP
    if img.mode != 'RGB':
        img = img.convert('RGB')

    # Optimize and save as WebP
    max_dim = 1200
    if img.width > max_dim or img.height > max_dim:
        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
    
    img.save(out_path, 'WEBP', quality=80)

    out_size = os.path.getsize(out_path)
    print(f"\nOptimized:")
    print(f"- Dimensions: {img.width}x{img.height}")
    print(f"- File size: {out_size} bytes")
    print(f"- Format: WEBP")
