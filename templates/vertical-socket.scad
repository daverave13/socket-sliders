socketDiameter = 24; // This should be the only param required
holeDiameter = socketDiameter + .75; // accounting for smooth clearance
sliderWidth = holeDiameter + 2 ;  // thickness (extrusion depth)

assert(socketDiameter > 0, "socketDiameter must be > 0");
assert(socketDiameter <= 28, "socketDiamter must be less than or equal to 28");

// label parameters, user EITHER labelNumerator/Denominator OR labelMetric
labelPosition = "bottomMid";
labelNumerator = undef; // expected parameter (required for imperial)
labelDenominator = undef; // expected parameter (required for imperial)
labelMetric = 13; // expected parameter (required for metric)

assert(!(labelPosition == "bottomMid" || labelPosition == "topMid") || socketDiameter < 25, "labelPosition cannot be \"bottomMid\" or \"topMid\" when socketDiameter is equal or greater than 25mm because the label will not fit. Please use one of the left or right label position options");

function isLabelMetric() = 
    !is_undef(labelMetric);
 
function isLabelImperial() =
    !is_undef(labelNumerator) &&
    !is_undef(labelDenominator);

assert(
    isLabelMetric() || isLabelImperial(), "Missing parameters: EITHER labelMetric OR labelNumerator and labelDenominator must be provided");
assert(
    !(isLabelMetric() && isLabelImperial()), "Extra parameters: label parameters for both metric and imperial labels has been provided. EITHER labelMetric OR labelNumerator and labelDenominator must be provided");
    
labelFile = isLabelMetric() ? str(labelMetric, "mm_bold.dxf") : str(labelNumerator, "_over_", labelDenominator, "_bold.dxf"); 


// shape controls
H = 13.05;
topL = 41.5;
bottomL = 35;
topLipH  = 3.5;
botLipH = 2.396;
diagHeight  = 4.896;
neckHalf = 15;
diagRun  = 2.5;

$fn = 128;

// Hole position in the cross-section (YZ plane)
hole_y = H + 1;
hole_z = sliderWidth/2;     

hole_len = topL;

module silhouette_2d() {
  cx = topL/2;
  bottomTrim = (topL - bottomL)/2;
  polygon(points=[
    [0, H],
    [topL, H],

    [topL, H - topLipH],
    [cx + neckHalf, H - topLipH],

    [cx + neckHalf, diagHeight],

    [cx + neckHalf + diagRun, botLipH],
    [ topL - bottomTrim, 0],
    [0, 0],

    [bottomTrim, 0],
    [bottomTrim, botLipH],
    [cx - neckHalf, diagHeight],

    [cx - neckHalf, H - topLipH],
    [0, H - topLipH]
  ]);
}

module body() {
  linear_extrude(height=sliderWidth)
    silhouette_2d();
}

module hole_through_length() {
  // Cylinder default axis is Z. Rotate so axis becomes X.
  // Then place it so it starts at the chosen end.
  x0 = holeDiameter>neckHalf*2 ? 20.75 : holeDiameter/2 + 6.5
    ;

  translate([topL/2, hole_y, hole_z])
    rotate([90, 90, 0])
      cylinder(h=hole_len, d=holeDiameter, center=false);
}

module model() {
  // cut hole through model
  difference() {
    body();
    hole_through_length();
  }
}

// Make Y become Z (so "height" is up)
rotate([90, 0, 90])
    model();


labelPath = str("./labels/", labelFile);
labelXOffset = isLabelMetric() ? len(str(labelMetric)) * 2.6 : len(str(labelNumerator)) + len(str(labelDenominator)) + .5;
labelYOffset = isLabelMetric() ? 8 : 2;

scaleFactor = isLabelMetric() ? .8 : .4;


if (labelPosition == "topLeft") {
translate([0, topL - labelYOffset, H])
    linear_extrude(height=.6)
        scale(scaleFactor)
            import(labelPath);
}
if (labelPosition == "topMid") {
translate([sliderWidth/2 - labelXOffset, topL - labelYOffset, H])
    linear_extrude(height=.6)
        scale(scaleFactor)
            import(labelPath);
}
if (labelPosition == "topRight") {
translate([sliderWidth - labelXOffset*2, topL - labelYOffset, H])
    linear_extrude(height=.6)
        scale(scaleFactor)
            import(labelPath);
}
if (labelPosition == "bottomLeft") {
translate([0, 0, H])
    linear_extrude(height=.6)
        scale(scaleFactor)
            import(labelPath);
}
if (labelPosition == "bottomMid") {
translate([sliderWidth/2 - labelXOffset, holeDiameter>25 ? -1 : 0, H])
    linear_extrude(height=.6)
        scale(scaleFactor)
            import(labelPath);
}
if (labelPosition == "bottomRight") {
translate([sliderWidth - labelXOffset*2, 0, H])
    linear_extrude(height=.6)
        scale(scaleFactor)
            import(labelPath);
}

// Known Limitations
// 1. Label cannot be in the middle positions if the socket diameter is too large (25mm cutoff)
