#!/usr/bin/env python3
"""
Simple icon generator using Python's built-in libraries
Creates placeholder PNG icons for the PWA
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a simple gradient icon with a location pin"""

    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)

    # Draw gradient background (purple)
    for y in range(size):
        # Gradient from #667eea to #764ba2
        r = int(102 + (118 - 102) * y / size)
        g = int(126 + (75 - 126) * y / size)
        b = int(234 + (162 - 234) * y / size)
        draw.rectangle([(0, y), (size, y+1)], fill=(r, g, b))

    # Draw a simple location pin
    center_x, center_y = size // 2, size // 2

    # Pin size based on icon size
    pin_height = int(size * 0.5)
    pin_width = int(size * 0.35)

    # Draw pin shape (simplified)
    # Top circle
    circle_radius = pin_width // 2
    circle_y = center_y - pin_height // 4
    draw.ellipse(
        [(center_x - circle_radius, circle_y - circle_radius),
         (center_x + circle_radius, circle_y + circle_radius)],
        fill='white',
        outline='white'
    )

    # Inner circle
    inner_radius = circle_radius // 2
    draw.ellipse(
        [(center_x - inner_radius, circle_y - inner_radius),
         (center_x + inner_radius, circle_y + inner_radius)],
        fill=(102, 126, 234)
    )

    # Pin bottom (triangle)
    triangle = [
        (center_x, circle_y + circle_radius + pin_height // 3),  # bottom point
        (center_x - circle_radius // 2, circle_y + circle_radius),  # left
        (center_x + circle_radius // 2, circle_y + circle_radius)   # right
    ]
    draw.polygon(triangle, fill='white')

    # Save the image
    img.save(filename, 'PNG')
    print(f"✓ Created {filename} ({size}x{size})")

def main():
    # Check if PIL is available
    print("Generating PWA icons...")

    # Create icons
    create_icon(192, 'icon-192.png')
    create_icon(512, 'icon-512.png')

    print("\n✅ Icons generated successfully!")
    print("Files created:")
    print("  - icon-192.png")
    print("  - icon-512.png")

if __name__ == '__main__':
    main()
