import bpy
import math
import os
from PIL import Image

# --- Configuration ---
# Object to rotate (e.g., "Armature", "Cube") - REPLACE WITH YOUR OBJECT NAME
obj_name = "Deer"
# Output directory (ensure it exists) - REPLACE WITH YOUR PATH
output_dir = "\\\\wsl.localhost\\Ubuntu\\home\\bskcx\\source\\cozycove\\blender\\sprites\\deer"
# List of (rotation_degrees, direction_name) for each angle
rotations = [
    (0, "front"), (45, "front-right"), (90, "right"), (135, "back-right"),
    (180, "back"), (225, "back-left"), (270, "left"), (315, "front-left")
]
# Frame step - render every Nth frame
frame_step = 4

# --- Setup Scene ---
# Make sure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Set camera to Orthographic for flat sprites
#bpy.context.scene.camera.data.type = 'ORTHO'
#bpy.context.scene.camera.data.ortho_scale = 5 # Adjust scale to fit your model

# Set render settings for transparency (RGBA PNG)
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.context.scene.render.image_settings.color_mode = 'RGBA'
bpy.context.scene.render.film_transparent = True

# Get the object to rotate
obj = bpy.data.objects.get(obj_name)
if not obj:
    print(f"Object '{obj_name}' not found!")
else:
# Get the object to rotate
obj = bpy.data.objects.get(obj_name)
if not obj:
    print(f"Object '{obj_name}' not found!")
else:
    # Get all animations from the object's animation data
    if not obj.animation_data or not obj.animation_data.nla_tracks:
        print(f"No NLA tracks found on '{obj_name}'!")
        print("Falling back to scene timeline...")
        animations = [{"name": "default", "start": bpy.context.scene.frame_start, "end": bpy.context.scene.frame_end}]
    else:
        animations = []
        for track in obj.animation_data.nla_tracks:
            for strip in track.strips:
                animations.append({
                    "name": strip.name,
                    "start": int(strip.frame_start),
                    "end": int(strip.frame_end),
                    "action": strip.action
                })
        print(f"Found {len(animations)} animation(s): {[a['name'] for a in animations]}")
    
    # Temporary directory for individual frames
    temp_dir = os.path.join(output_dir, "temp_frames")
    os.makedirs(temp_dir, exist_ok=True)
    
    # Store all frame paths for compositing [animation][direction][frame]
    all_frames = []
    max_frames_per_anim = 0
    
    # --- Main Loop ---
    # Iterate through each animation
    for anim_idx, anim in enumerate(animations):
        print(f"Rendering animation: {anim['name']} (frames {anim['start']}-{anim['end']})")
        
        # Set the active action if using NLA tracks
        if 'action' in anim and anim['action']:
            obj.animation_data.action = anim['action']
        
        anim_frames = []
        
        # Iterate through each direction
        for rot_deg, direction in rotations:
            # Set object's Z-axis rotation
            obj.rotation_euler[2] = math.radians(rot_deg)
            
            row_frames = []
            # Render frames with step
            for frame in range(anim['start'], anim['end'] + 1, frame_step):
                # Set current frame
                bpy.context.scene.frame_set(frame)
                
                # Set output path for this animation, direction & frame
                current_output_path = os.path.join(temp_dir, f"anim{anim_idx}_{direction}_frame{frame:04d}.png")
                bpy.context.scene.render.filepath = current_output_path
                
                # Render the current frame
                bpy.ops.render.render(write_still=True)
                row_frames.append(current_output_path)
            
            anim_frames.append(row_frames)
            
        all_frames.append(anim_frames)
        max_frames_per_anim = max(max_frames_per_anim, len(anim_frames[0]) if anim_frames else 0)
    
    # --- Compose Sprite Sheet ---
    print("Composing sprite sheet...")
    
    # Load first image to get dimensions
    first_img = Image.open(all_frames[0][0][0])
    frame_width, frame_height = first_img.size
    first_img.close()
    
    # Calculate sprite sheet dimensions
    # Rows: num_animations * num_directions
    # Cols: maximum frames across all animations
    num_animations = len(animations)
    num_directions = len(rotations)
    total_rows = num_animations * num_directions
    num_cols = max_frames_per_anim
    
    sheet_width = frame_width * num_cols
    sheet_height = frame_height * total_rows
    
    # Create sprite sheet
    sprite_sheet = Image.new('RGBA', (sheet_width, sheet_height), (0, 0, 0, 0))
    
    # Paste each frame into the sprite sheet
    # Layout: Each animation takes up num_directions rows, animations stack vertically
    for anim_idx, anim_frames in enumerate(all_frames):
        for dir_idx, row_frames in enumerate(anim_frames):
            row_position = (anim_idx * num_directions) + dir_idx
            for col_idx, frame_path in enumerate(row_frames):
                frame_img = Image.open(frame_path)
                x = col_idx * frame_width
                y = row_position * frame_height
                sprite_sheet.paste(frame_img, (x, y))
                frame_img.close()
    
    # Save sprite sheet
    output_path = os.path.join(output_dir, "deer_spritesheet.png")
    sprite_sheet.save(output_path)
    sprite_sheet.close()
    
    # Clean up temporary frames
    import shutil
    shutil.rmtree(temp_dir)
    
    print(f"Sprite sheet saved to: {output_path}")
    print(f"Dimensions: {sheet_width}x{sheet_height}")
    print(f"Layout: {num_animations} animation(s) × {num_directions} direction(s) = {total_rows} rows, {num_cols} columns")
    print(f"Frame size: {frame_width}x{frame_height}")
    for anim_idx, anim in enumerate(animations):
        start_row = anim_idx * num_directions
        end_row = start_row + num_directions - 1
        print(f"  Animation '{anim['name']}': rows {start_row}-{end_row}")

print("Sprite sheet rendering complete!")

