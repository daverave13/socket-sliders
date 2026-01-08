# OpenSCAD Socket Holder Templates

This directory contains parametric OpenSCAD templates for generating socket holders.

## Templates

### vertical-socket.scad
Creates a vertical socket holder where the socket sits upright.

**Parameters:**
- `outer_diameter_mm`: Outer diameter of the socket in millimeters
- `nominal_label`: Text label for the socket (e.g., "10mm" or "3/8\"")

### horizontal-socket.scad
Creates a horizontal socket holder where the socket lays on its side.

**Parameters:**
- `outer_diameter_mm`: Outer diameter of the socket in millimeters
- `length_mm`: Length of the socket in millimeters
- `nominal_label`: Text label for the socket (e.g., "10mm" or "3/8\"")

## Testing Templates

You can test these templates directly with OpenSCAD:

```bash
# Vertical socket (10mm)
openscad -o vertical-10mm.stl vertical-socket.scad \
  -D 'outer_diameter_mm=12.5' \
  -D 'nominal_label="10mm"'

# Horizontal socket (3/8")
openscad -o horizontal-3-8.stl horizontal-socket.scad \
  -D 'outer_diameter_mm=14.5' \
  -D 'length_mm=25.4' \
  -D 'nominal_label="3/8\""'
```

## Design Features

- **Parametric**: All dimensions calculated from input parameters
- **Clearance**: Sockets have 0.3mm clearance for easy fit
- **Labels**: Text embossed on holder for identification
- **Grip rings**: Vertical holders have grip rings for socket retention
- **Stability**: Wide base/feet for stable placement
- **Easy removal**: Horizontal holders have cutouts for finger access

## Customization

The templates use reasonable defaults for wall thickness, base height, and other structural parameters. These can be modified in the template files if needed for specific use cases.
