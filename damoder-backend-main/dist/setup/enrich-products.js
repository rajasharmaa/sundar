"use strict";
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const enrichmentData = {
    "(1) G.I ELBOW(ISI)": {
        description: "Heavy-duty Galvanized Iron (GI) 90-degree elbows, manufactured with premium grade malleable cast iron and hot-dip galvanized coating for superior rust protection. Conforms to ISI standards for high pressure plumbing.",
        material: "Malleable Galvanized Iron",
        pressureRating: "Class 150 (up to 25 bar)",
        temperatureRange: "-20°C to 120°C",
        standards: "IS 1879 / ISI Certified",
        application: "Water distribution lines, HVAC plumbing, industrial liquid transmission, and agricultural grids.",
        specifications: {
            "Thread Type": "BSPT Female",
            "Size Range": "1/2 inch to 4 inch",
            "Zinc Coating": ">= 55 microns"
        }
    },
    "(2) G.I TEE(ISI)": {
        description: "Galvanized Iron equal tees designed for joining three pipes with equal diameters. ISI marked hot-dip galvanized coating resists corrosive water conditions.",
        material: "Malleable Galvanized Iron",
        pressureRating: "Class 150 (PN 25)",
        temperatureRange: "-20°C to 120°C",
        standards: "IS 1879 / ISI Certified",
        application: "Bifurcating pipeline flow in high-pressure water grids, gas lines, and industrial plumbing.",
        specifications: {
            "Thread Type": "BSPT Female Thread",
            "Zinc Coating": ">= 55 microns",
            "Configuration": "Equal Tee"
        }
    },
    "(3) G.I SOCKET(ISI)": {
        description: "ISI certified Galvanized Iron full couplings (sockets) designed for inline connection of two male threaded pipes. Precision machined female threads minimize leaks.",
        material: "Malleable Galvanized Iron",
        pressureRating: "Class 150 (up to 360 psi)",
        temperatureRange: "-20°C to 120°C",
        standards: "IS 1879 / ISI Certified",
        application: "Pipeline extensions, commercial building water lines, water supply infrastructure.",
        specifications: {
            "Connection": "Female Threaded",
            "Thread Standard": "ISO 7-1",
            "Joint Type": "Straight Coupling"
        }
    },
    "(4) G.I UNION(ISI)": {
        description: "Three-piece ISI marked Galvanized Iron pipe unions. Designed to allow quick assembly/disassembly of piping systems without cutting or dismantling.",
        material: "Malleable Galvanized Iron",
        pressureRating: "Class 150",
        temperatureRange: "-20°C to 120°C",
        standards: "IS 1879 / ISI Certified",
        application: "Industrial piping maintenance joints, pump installation lines, valve bypass lines.",
        specifications: {
            "Seat Type": "Flat Seat (with gasket)",
            "Joint Style": "3-Piece Union",
            "Threading": "BSPT Female"
        }
    },
    "(5) G.I CROSS(ISI)": {
        description: "Galvanized Iron 4-way cross fittings for joining four pipelines at right angles. Crucial for heavy-duty industrial pipe manifolds.",
        material: "Malleable Galvanized Iron",
        pressureRating: "Class 150 (PN 25)",
        temperatureRange: "-20°C to 120°C",
        standards: "IS 1879 / ISI Certified",
        application: "Fire protection sprinkler manifolds, distribution lines, water processing grids.",
        specifications: {
            "Layout": "4-Way Cross",
            "Thread": "BSPT Female",
            "Coating": "Hot-Dip Galvanized"
        }
    },
    "(6) G.I ELBOW&SOCKET(1/2X1/4)": {
        description: "Specialized reduced configuration combo kit including 1/2\" x 1/4\" G.I. elbow and matching inline socket. Perfect for micro-plumbing and gauge mounting setups.",
        material: "Malleable Galvanized Iron",
        pressureRating: "Class 150",
        temperatureRange: "-10°C to 120°C",
        standards: "IS 1879 Standards",
        application: "Instrument pipelines, gauge installations, mechanical hydraulic setups.",
        specifications: {
            "Thread Configuration": "Reducing Size 1/2\" x 1/4\"",
            "Seal": "Precision BSPT threads"
        }
    },
    "(7) G.I  OD ELBOW(M&F)": {
        description: "Galvanized Iron 90-degree Street Elbows featuring Male & Female (M&F) threads. Eliminates the need for close nipples, enabling tight-space turns.",
        material: "Malleable Galvanized Iron",
        pressureRating: "Class 150",
        temperatureRange: "-20°C to 120°C",
        standards: "BS 143 & 1256 / IS 1879",
        application: "Tight space plumbing routing, pump connection headers, commercial piping bypass.",
        specifications: {
            "Fitting Type": "Street Elbow (M&F)",
            "Bend Angle": "90 Degrees",
            "Thread": "BSPT Male-Female"
        }
    },
    "(8) G.I THREEWAY ELBOW": {
        description: "Specialized three-way corner outlet Galvanized Iron elbows, perfect for corner frames, rack setups, and multi-directional pipe routing.",
        material: "Malleable Galvanized Iron",
        pressureRating: "Class 150",
        temperatureRange: "-20°C to 110°C",
        standards: "Industrial Standards",
        application: "Corner structural pipe connections, railing grids, specialized industrial piping manifolds.",
        specifications: {
            "Outlets": "3-Way Outlet",
            "Shape": "90 Degree Corner",
            "Connection": "BSPT Female"
        }
    },
    "(9) G.I RED TEE (2 1 ½ X ½)": {
        description: "Heavy-duty Galvanized Iron reducing tee, size 2-1/2\" x 1/2\". Enables stepping down pipeline flow size cleanly to hook up auxiliary branch feeds.",
        material: "Malleable Galvanized Iron",
        pressureRating: "Class 150",
        temperatureRange: "-20°C to 120°C",
        standards: "IS 1879 / Malleable Steel Specs",
        application: "Auxiliary branch lines, water feed reduction pipes, HVAC pressure gauge taps.",
        specifications: {
            "Configuration": "Reducing Tee",
            "Branch Size": "1/2 inch",
            "Run Size": "2-1/2 inch x 2-1/2 inch"
        }
    },
    "(10) G.I ELBOW (NON)": {
        description: "Non-ISI standard hot-dip galvanized elbow fittings, offering a highly economical solution for low-pressure drainage, cable routing, or structure assembly.",
        material: "Cast Galvanized Iron",
        pressureRating: "Low Pressure (up to 10 bar)",
        temperatureRange: "-10°C to 80°C",
        standards: "Non-ISI Commercial Grade",
        application: "Low pressure drainage, structural frames, electrical conduit protection.",
        specifications: {
            "Angle": "90 Degree",
            "Connection": "Female Threaded",
            "Type": "Non-ISI Economy"
        }
    },
    "(11) G.I TEE (NON)": {
        description: "Non-ISI standard equal tee fitting for low-pressure line division. Cost-effective B2B choice for drainage pipes or structural framework constructions.",
        material: "Cast Galvanized Iron",
        pressureRating: "Low Pressure (up to 10 bar)",
        temperatureRange: "-10°C to 80°C",
        standards: "Non-ISI Commercial Grade",
        application: "Structural frameworks, low pressure plumbing, water discharge systems.",
        specifications: {
            "Joint": "Equal Tee",
            "Grade": "Economy Non-ISI",
            "Connection": "BSPT Female"
        }
    },
    "(12) ROYAL (Y)": {
        description: "Royal Series premium Y-strainers and fittings, designed to protect downstream pumps and control valves from scale, debris, and welding slag.",
        material: "Ductile Iron / Cast Iron body",
        pressureRating: "PN 16 / Class 125",
        temperatureRange: "-10°C to 120°C",
        standards: "BS 2080 / DIN Standards",
        application: "Slag protection, water filtration systems, pump suction lines.",
        specifications: {
            "Screen Mesh": "SS304 Mesh",
            "Screen Size": "1.5mm standard",
            "Configuration": "Y-Type Strainer"
        }
    },
    "(13) BORECAP “TIKLI” (H)": {
        description: "Heavy-duty Borewell Cap (Tikli model) made of thick gauge sheet steel with anti-corrosive powder coating. Keeps debris and contaminants out of deep wells.",
        material: "Heavy Gauge Sheet Steel",
        pressureRating: "Structural Weather-tight",
        temperatureRange: "-20°C to 70°C",
        standards: "Custom Well-Cap Standards",
        application: "Borewell head seals, agricultural well protection, deep pump caps.",
        specifications: {
            "Thickness": "Heavy Duty 3.0mm+",
            "Coating": "Weatherproof Blue Powder",
            "Well Diameter": "Standard fit sizes"
        }
    },
    "(14) BORECAP “HOLE” (L)": {
        description: "Light-duty Borewell cap featuring a pre-drilled central hole to allow pump electrical cable and riser pipe routing. Cost-effective protection.",
        material: "Light Gauge Sheet Steel",
        pressureRating: "Weather protection",
        temperatureRange: "-10°C to 60°C",
        standards: "Standard Commercial",
        application: "Domestic borewells, pump electrical line layouts, agricultural pipe seals.",
        specifications: {
            "Cable Hole": "Yes (with rubber grommet support)",
            "Thickness": "Light Duty 1.5mm",
            "Finish": "Galvanized / Powder Coated"
        }
    },
    "(15) BORECAP PLAIN": {
        description: "Standard plain borewell cap. Solid construction prevents rainwater, insects, and sand from entering unused deep boreheads.",
        material: "Standard Sheet Steel",
        pressureRating: "Structural sealing",
        temperatureRange: "-15°C to 65°C",
        standards: "Commercial Standard",
        application: "Unused well closures, deep well preservation, temporary site bore sealing.",
        specifications: {
            "Model": "Plain (no hole)",
            "Coating": "Anti-Rust Primer",
            "Fit Style": "Slip-On Bolt Lock"
        }
    },
    "(16) G.I NIPPLE (L)": {
        description: "Lightweight short Galvanized Iron pipe nipple, threaded on both ends (double nipple). Ideal for low-pressure coupling segments.",
        material: "Carbon Steel (Light Duty)",
        pressureRating: "Medium Pressure (up to 16 bar)",
        temperatureRange: "-20°C to 120°C",
        standards: "IS 1239 (Part 2)",
        application: "Sanitary connections, small hydraulic setups, domestic plumbing links.",
        specifications: {
            "Thickness Class": "Light (Class A)",
            "Threading": "BSPT Male both ends",
            "Tube Style": "Welded Steel Pipe Nipple"
        }
    },
    "(17) G.I NIPPLE (A)": {
        description: "Medium Class A Galvanized Iron pipe nipple, offering a balance of high mechanical strength and corrosion resistance for medium-pressure fluids.",
        material: "Carbon Steel (Medium Class)",
        pressureRating: "High-Medium (up to 20 bar)",
        temperatureRange: "-20°C to 150°C",
        standards: "IS 1239 (Part 2)",
        application: "HVAC distribution pipes, boiler feed auxiliary pipes, oil supply systems.",
        specifications: {
            "Pipe Thickness": "Medium (Class B)",
            "Connection": "Dual-End Male Thread",
            "Lengths": "3 inch to 12 inch"
        }
    },
    "(18) G.I NIPPLE (B) (PRAKASH)": {
        description: "Premium Prakash brand heavy Class B Galvanized Iron double pipe nipple. Extra wall thickness handles severe water hammer and vibration.",
        material: "Heavy-Duty Carbon Steel",
        pressureRating: "High Pressure (up to 25 bar)",
        temperatureRange: "-30°C to 200°C",
        standards: "IS 1239 Heavy Class / Prakash Certified",
        application: "Heavy industrial water lines, fire fighting systems, oil refining process lines.",
        specifications: {
            "Wall Class": "Heavy (Class C)",
            "Brand": "Prakash Pipes",
            "Construction": "Seamless / High Grade"
        }
    },
    "(19) GP APOLLO RAIJER PIPE": {
        description: "Apollo brand premium Galvanized Iron riser (raijer) pipe. Features heavy-duty seamless wall profiling for submersible deep pumps.",
        material: "Galvanized Structural Steel",
        pressureRating: "High Pressure (PN 32)",
        temperatureRange: "-25°C to 180°C",
        standards: "IS 1239 / Apollo Seamless Specs",
        application: "Submersible pump riser pipes, deep tube well extraction pipelines, industrial high lift systems.",
        specifications: {
            "Brand": "Apollo",
            "Pipe Type": "Riser / Raijer Pipe",
            "Wall Thickness": "Heavy Duty Riser Grade"
        }
    },
    "(20) S.S CNC PIPE NIPPLE": {
        description: "Stainless Steel pipe nipple precision-machined on advanced CNC stations. Excellent acid, alkaline, and high-temperature chemical resistance.",
        material: "Stainless Steel SS304/SS316",
        pressureRating: "Extreme Pressure (Class 300 / PN 40)",
        temperatureRange: "-100°C to 450°C",
        standards: "ASTM A733 / ASME B16.11",
        application: "Chemical processing lines, pharmaceutical manufacturing, acidic fluid piping, marine applications.",
        specifications: {
            "Material Grade": "SS304 CNC Machined",
            "Thread Style": "NPT Male",
            "Processing": "CNC Turned & Deburred"
        }
    },
    "(21) CONNECTION CLAMP (H) WITH COMPLETE SET.": {
        description: "Heavy-duty steel connection pipe clamp, complete with high-tensile fasteners, bolts, and rubber vibration-damping liners. Ideal for overhead pipes.",
        material: "Carbon Steel (Zinc Plated) with EPDM Rubber liner",
        pressureRating: "Structural Weight Capacity: 500kg+",
        temperatureRange: "-20°C to 110°C",
        standards: "Heavy Clamp DIN Standards",
        application: "Suspended pipe supports, industrial piping networks, high-vibration engine loops.",
        specifications: {
            "Clamp Style": "EPDM Rubber Lined Pipe Clamp",
            "Fasteners": "Grade 8.8 Bolts Included",
            "Mounting Type": "Suspended Threaded Rod"
        }
    },
    "(22) ARTI THREAD BALL C/V": {
        description: "Arti brand brass threaded inline ball check valve (C/V). Prevents backflow in water distribution systems. Heavy brass construction for long-term use.",
        material: "Forged Brass body, Stainless Steel spring",
        pressureRating: "PN 20 (up to 20 bar)",
        temperatureRange: "0°C to 95°C",
        standards: "ISO 228 / European Check Valve Specs",
        application: "Pump backflow prevention, solar water heater lines, domestic overhead tanks.",
        specifications: {
            "Valve Type": "Inline Ball Check Valve",
            "Connection": "BSPT Female Threaded",
            "Seal": "NBR / Teflon Seat"
        }
    }
};
const enrichProducts = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        const finalUri = uri.includes('.net/?')
            ? uri.replace('.net/?', '.net/damodarTraders?')
            : uri.includes('.net/')
                ? uri
                : `${uri}/damodarTraders`;
        await mongoose.connect(finalUri);
        console.log('Connected to Database!');
        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');
        const products = await productsCollection.find({}).toArray();
        console.log(`Processing ${products.length} products...`);
        let enrichedCount = 0;
        for (const product of products) {
            const data = enrichmentData[product.name];
            if (data) {
                // Convert specifications object to Map for schema compatibility if required
                const specMap = new Map();
                Object.entries(data.specifications).forEach(([key, val]) => {
                    specMap.set(key, val);
                });
                await productsCollection.updateOne({ _id: product._id }, {
                    $set: {
                        description: data.description,
                        material: data.material,
                        pressureRating: data.pressureRating,
                        temperatureRange: data.temperatureRange,
                        standards: data.standards,
                        application: data.application,
                        specifications: specMap
                    }
                });
                console.log(`✓ Enriched: "${product.name}"`);
                enrichedCount++;
            }
            else {
                console.log(`✕ No matching mapping for: "${product.name}"`);
            }
        }
        console.log(`\nEnrichment complete! Successfully enriched ${enrichedCount} products.`);
        process.exit(0);
    }
    catch (error) {
        console.error('Enrichment failed:', error);
        process.exit(1);
    }
};
enrichProducts();
