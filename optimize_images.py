import os
from PIL import Image

assets_dir = 'src/assets'
for root, dirs, files in os.walk(assets_dir):
    for file in files:
        if file.lower().endswith(('.jpg', '.jpeg', '.png')) and not file.startswith('0'):
            path = os.path.join(root, file)
            try:
                if os.path.getsize(path) > 500 * 1024:
                    print(f"Optimizing {path}")
                    with Image.open(path) as img:
                        webp_path = os.path.splitext(path)[0] + '.webp'
                        
                        # Resize if too large
                        max_dim = 1920
                        if img.width > max_dim or img.height > max_dim:
                            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                            
                        # Save as webp
                        img.save(webp_path, 'WEBP', quality=80)
                        
                        # Remove original if webp is smaller
                        if os.path.getsize(webp_path) < os.path.getsize(path):
                            print(f"Replacing {path} with {webp_path}")
                            # To update references in code, wait...
                            # Actually, updating references in the code is hard if I just change the extension.
                            # So instead of converting to webp, I can just overwrite the original with a compressed/resized version of the SAME format! That way I don't have to rewrite 100s of imports!
                            img.save(path, optimize=True, quality=80)
                        if os.path.exists(webp_path):
                            os.remove(webp_path)
            except Exception as e:
                print(f"Failed to process {path}: {e}")
