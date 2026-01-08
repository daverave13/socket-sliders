socketDiameter = 27.3; // expected parameter, outer diameter of socket
holeDiameter = socketDiameter + .75; // accounting for smooth clearance
sliderWidth = holeDiameter + 2 ;  // total thickness

assert(socketDiameter > 0, "socketDiameter must be greater than 0");
assert(socketDiameter <= 27.3, "socketDiameter must be less than or equal to 27.3");

socketLength = 65; // expected parameter, length of socket when laid on side
holeLength = min(socketLength + 3, 70.5);

assert(socketLength < 67, "socketLength must be less than 67");
assert(socketLength > 0, "socketLength must be greater than 0");

// label parameters, user EITHER labelNumerator/Denominator OR labelMetric
labelNumerator = 13; // expected parameter (required for imperial)
labelDenominator = 16; // expected parameter (required for imperial)
labelMetric = undef; // expected parameter (required for metric)

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
topL = 83.5;
bottomL = 77;
topLipH  = 3.5;
botLipH = 2.396;
diagHeight  = 4.896;
neckHalf = 36;
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
  x0 = 6.5;

  translate([x0, hole_y, hole_z])
    rotate([0, 90, 0])
      cylinder(h=holeLength, d=holeDiameter, center=false);
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
labelXOffset = isLabelMetric() ? len(str(labelMetric)) * 2.5 : len(str(labelNumerator)) + len(str(labelDenominator)) + .5;
labelYOffset = isLabelMetric() ? 17 : 9;

scaleFactor = isLabelMetric() ? .8 : .4;

translate([sliderWidth/2 - labelXOffset, topL - labelYOffset, H])
    linear_extrude(height=.6)
        scale(scaleFactor)
            import(labelPath);
