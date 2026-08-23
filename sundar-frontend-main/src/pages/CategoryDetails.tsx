import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Shield, Zap, Target, Box, CheckCircle2, ChevronRight, ArrowRight, Settings, Factory, ChevronDown, Layers, Droplets, Ruler, Weight, Thermometer, Eye, Leaf, Globe, MapPin } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { api, type Product } from '@/services/api/api-client';
import { ImagePlaceholder } from '@/components/common/ui/ImagePlaceholder';
import CountUp from 'react-countup';

// ─── CATEGORY DATA ───────────────────────────────────────────────
const categoryContentData: Record<string, any> = {
  // ─── 1. PP Woven Bags ───
  'pp-woven-bags': {
    title: 'PP Woven Bags Manufacturer',
    subtitle: 'High-Performance Polypropylene Woven Sacks for Agriculture & Industry',
    image: '/pp-woven-bags.png',
    heroImage: '/machine/machine 1.jpeg',
    intro: 'Polypropylene (PP) woven bags are the industry standard for packaging bulk commodities. Manufactured from high-tenacity PP tapes on circular looms, these bags deliver unmatched strength-to-weight ratio, breathability, and cost-effectiveness for applications ranging from 5 kg retail pouches to 50 kg industrial sacks.',
    detailedContent: 'Our PP woven bags are produced using 100% virgin polypropylene granules, ensuring consistent quality and compliance with food-grade standards. The circular weaving technology creates a seamless tubular fabric that eliminates weak points. Each bag undergoes tensile strength testing, drop testing, and seam-strength verification before dispatch. We offer both laminated and unlaminated variants — laminated bags provide an additional moisture barrier and superior printability, while unlaminated bags offer breathability ideal for agricultural produce.',
    features: [
      'Tensile strength up to 3500 N per 5cm strip',
      'UV stabilized for 800+ hours outdoor exposure',
      '100% recyclable and reusable material',
      'Breathable fabric prevents moisture buildup',
      'Resistant to acids, alkalis, and solvents',
      'FDA compliant for food-contact applications'
    ],
    manufacturingSteps: [
      { title: 'Tape Extrusion', desc: 'Virgin PP granules are melted at 230°C and extruded into flat tapes of precise denier and width through a flat-die system.', icon: Zap },
      { title: 'Circular Weaving', desc: 'High-speed circular looms interlace warp and weft tapes into seamless tubular fabric at 800+ picks per minute.', icon: Settings },
      { title: 'Lamination (Optional)', desc: 'BOPP film or PE coating is extrusion-laminated onto the fabric for moisture protection and enhanced print surface.', icon: Layers },
      { title: 'Cutting & Stitching', desc: 'Automated machines cut to exact dimensions and bottom-fold/stitch with high-tenacity thread for maximum seam strength.', icon: Target }
    ],
    finishes: ['Plain Uncoated', 'PE Laminated', 'BOPP Laminated', 'Perforated (Breathable)', 'Gusseted', 'Valve Type'],
    applications: ['Fertilizers & Chemicals', 'Flour & Grain', 'Animal Feed', 'Sugar & Salt', 'Cement & Plaster', 'Seeds & Pulses'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Base Material', value: '100% Virgin Polypropylene (PP)' },
        { label: 'Tape Denier', value: '800 – 1200 D' },
        { label: 'Fabric GSM', value: '55 – 120 g/m²' },
        { label: 'Mesh Count', value: '10×10 to 14×14 per inch' },
        { label: 'Coating (if laminated)', value: 'LDPE / BOPP Film' },
        { label: 'UV Stabilizer', value: '0.5% – 2% masterbatch' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Standard', 'Heavy Duty', 'Premium Laminated'],
      rows: [
        ['Fabric GSM', '55 – 70', '75 – 100', '90 – 120'],
        ['Load Capacity', '10 – 25 kg', '25 – 50 kg', '25 – 50 kg'],
        ['Width Range', '35 – 65 cm', '45 – 75 cm', '40 – 70 cm'],
        ['Length Range', '60 – 110 cm', '80 – 120 cm', '70 – 115 cm'],
        ['Print Colors', 'Up to 4', 'Up to 6', 'Up to 8 (HD)'],
        ['Seam Strength', '≥ 800 N', '≥ 1200 N', '≥ 1200 N'],
      ]
    },
    faqs: [
      { q: 'What is the difference between laminated and unlaminated PP woven bags?', a: 'Laminated bags have a thin PE or BOPP coating on the fabric surface, providing superior moisture protection and a smooth surface for high-quality printing. Unlaminated bags are breathable, making them ideal for agricultural products like potatoes and onions that need aeration.' },
      { q: 'Can you produce food-grade PP woven bags?', a: 'Yes. Our bags are manufactured using 100% virgin PP granules and comply with FDA and FSSAI standards for direct food contact. We also offer bags with inner PE liners for added protection.' },
      { q: 'What is the minimum order quantity?', a: 'For standard sizes, our MOQ starts at 5,000 pieces. For custom printed bags, the MOQ is typically 10,000 pieces due to printing plate setup costs.' },
      { q: 'How long do PP woven bags last in outdoor conditions?', a: 'With UV stabilization, our bags can withstand 800+ hours of direct UV exposure. For extended outdoor storage, we recommend our enhanced UV-stabilized variants with up to 1600 hours of protection.' }
    ]
  },

  // ─── 2. BOPP Laminated Bags ───
  'bopp-laminated-bags': {
    title: 'BOPP Laminated Bags Manufacturer',
    subtitle: 'Premium Multicolor Printed Packaging for Maximum Shelf Appeal',
    image: '/bopp-laminated.png',
    heroImage: '/machine/machine3.jpeg',
    intro: 'BOPP (Biaxially Oriented Polypropylene) laminated bags represent the gold standard in retail-grade industrial packaging. The fusion of a sturdy PP woven base with a reverse-printed BOPP film delivers photographic print quality, exceptional moisture barrier properties, and a premium look that elevates brand presence on retail shelves.',
    detailedContent: 'Our BOPP laminated bags are produced using a multi-stage process. First, the design artwork is reverse-printed onto a transparent BOPP film using rotogravure or CI flexo technology, ensuring the ink layer is sandwiched between the film and fabric — this makes the print scratch-proof and water-resistant. The printed film is then extrusion-coated onto the PP woven fabric using a molten PE adhesive layer, creating a permanently bonded, high-strength laminate.',
    features: [
      'Photographic HD print quality up to 8 colors',
      'Reverse printing protects ink from scratches',
      'Excellent moisture and gas barrier',
      'High gloss or matte finishes available',
      'Tear-resistant and puncture-proof',
      'Available in block-bottom and pillow styles'
    ],
    manufacturingSteps: [
      { title: 'Rotogravure Printing', desc: 'High-resolution artwork is reverse-printed onto BOPP film using engraved cylinders for photographic quality.', icon: Eye },
      { title: 'Extrusion Lamination', desc: 'Printed BOPP film is bonded to PP woven fabric using a molten PE adhesive layer at 280°C.', icon: Layers },
      { title: 'Tubing & Gusseting', desc: 'The laminated fabric is formed into a tube and side gussets are created for volume expansion.', icon: Target },
      { title: 'Bottom Sealing & Stitching', desc: 'Bags are sealed with heat or stitched with fold-over for a clean, professional finish.', icon: Box }
    ],
    finishes: ['High Gloss', 'Matte Finish', 'Metallic/Pearl Effect', 'Clear Window Panel', 'Anti-Slip Coating'],
    applications: ['Premium Rice & Basmati', 'Pet Food & Animal Nutrition', 'Specialty Fertilizers', 'Wall Putty & Construction', 'Detergents & FMCG'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Outer Layer', value: 'BOPP Film (20 – 40 micron)' },
        { label: 'Adhesive Layer', value: 'Low-Density Polyethylene (LDPE)' },
        { label: 'Base Fabric', value: 'PP Woven (60 – 100 GSM)' },
        { label: 'Print Type', value: 'Rotogravure / CI Flexo' },
        { label: 'Colors', value: 'Up to 8 (CMYK + Spot)' },
        { label: 'Inner Liner', value: 'Optional PE liner' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Standard', 'Premium', 'Block Bottom'],
      rows: [
        ['Total GSM', '80 – 110', '100 – 140', '110 – 150'],
        ['Load Capacity', '5 – 25 kg', '10 – 50 kg', '10 – 50 kg'],
        ['Print Resolution', '120 LPI', '150 LPI', '150 LPI'],
        ['Moisture Barrier', 'Good', 'Excellent', 'Excellent'],
        ['Shelf Appeal', '★★★★', '★★★★★', '★★★★★'],
        ['MOQ', '10,000 pcs', '10,000 pcs', '15,000 pcs'],
      ]
    },
    faqs: [
      { q: 'What is the MOQ for custom BOPP bags?', a: 'The minimum order quantity for custom BOPP bags is 10,000 pieces due to the cylinder/plate setup required for rotogravure printing.' },
      { q: 'How many colors can you print on BOPP bags?', a: 'We can print up to 8 colors using our rotogravure machines, including CMYK process colors and Pantone spot colors for exact brand matching.' },
      { q: 'Can you make BOPP bags with a block bottom?', a: 'Yes, we specialize in block-bottom BOPP bags that stand upright on shelves. These are popular for rice, pet food, and premium product packaging.' }
    ]
  },

  // ─── 3. BOPP/PP Block Bottom Bags ───
  'block-bottom-bags': {
    title: 'BOPP/PP Block Bottom Bags',
    subtitle: 'Self-Standing, Shelf-Ready Packaging with Superior Brand Visibility',
    image: '/bopp-pp-block-bottom.png',
    heroImage: '/machine/machine4.jpeg',
    intro: 'Block bottom bags (also known as square bottom or box bottom bags) are an advanced packaging format designed to stand upright on retail shelves. Unlike traditional pillow-style bags, block bottom bags maximize shelf space utilization, provide a larger printable surface for branding, and offer a premium, modern appearance that communicates product quality.',
    detailedContent: 'Our block bottom bags are engineered with precision-folded corners that create a stable, flat base when filled. Available in both PP woven and BOPP laminated variants, these bags combine structural integrity with outstanding visual appeal. The block-bottom construction allows for easy palletization and stacking, reducing logistics costs while increasing retail visibility.',
    features: [
      'Self-standing design for retail shelf display',
      '360° branding surface with HD printing',
      'Easy-fill open-top construction',
      'Stable stacking on pallets',
      'Available with carry handles',
      'Optional valve filling port for automation'
    ],
    manufacturingSteps: [
      { title: 'Fabric Preparation', desc: 'PP woven fabric or BOPP laminate is cut to precision dimensions for the block-bottom format.', icon: Ruler },
      { title: 'Printing', desc: 'Multi-color printing applied on all sides for maximum brand coverage and shelf visibility.', icon: Eye },
      { title: 'Block Bottom Formation', desc: 'Specialized machines fold and seal the bottom corners to create a perfectly flat, stable base.', icon: Box },
      { title: 'Valve & Handle (Optional)', desc: 'Automated valve insertion and handle attachment for easy filling and carrying.', icon: Settings }
    ],
    finishes: ['BOPP Gloss Laminated', 'BOPP Matte Laminated', 'PE Coated', 'With Carry Handle', 'With Valve Port'],
    applications: ['Rice & Premium Grains', 'Wall Putty & Adhesives', 'Cattle & Poultry Feed', 'Flour & Semolina', 'Chemical Powders'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Body Material', value: 'PP Woven / BOPP Laminated' },
        { label: 'Bottom Fold', value: 'Heat-Sealed or Stitched' },
        { label: 'Fabric GSM', value: '70 – 130 g/m²' },
        { label: 'Handle', value: 'D-Cut or Flat PP Tape' },
        { label: 'Valve', value: 'PE Film Valve (optional)' },
        { label: 'Liner', value: 'PE Liner (optional)' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'PP Woven Block', 'BOPP Laminated Block', 'Valve Type'],
      rows: [
        ['Capacity', '5 – 50 kg', '5 – 50 kg', '20 – 50 kg'],
        ['Width', '30 – 55 cm', '30 – 55 cm', '35 – 55 cm'],
        ['Height', '50 – 90 cm', '50 – 90 cm', '60 – 90 cm'],
        ['Gusset Depth', '8 – 18 cm', '8 – 18 cm', '10 – 18 cm'],
        ['Print Colors', 'Up to 6', 'Up to 8', 'Up to 6'],
        ['Filling', 'Open Top', 'Open Top', 'Valve Port'],
      ]
    },
    faqs: [
      { q: 'What is a block bottom bag?', a: 'A block bottom bag has a flat, square-shaped bottom that allows it to stand upright on its own, similar to a paper grocery bag. This design maximizes shelf space and provides 360-degree branding opportunities.' },
      { q: 'Can block bottom bags be filled on automatic machines?', a: 'Yes. Our valve-type block bottom bags are specifically designed for automatic filling lines used in cement, chemical, and food industries.' },
      { q: 'What sizes are available?', a: 'We manufacture block bottom bags from 5 kg to 50 kg capacity, with custom dimensions available to match your product and packing line requirements.' }
    ]
  },

  // ─── 4. FIBC Bags ───
  'fibc-bags': {
    title: 'FIBC Bags Manufacturer',
    subtitle: 'Flexible Intermediate Bulk Containers — 500 kg to 2000 kg Capacity',
    image: '/fibc-bags.png',
    heroImage: '/machine/machin2.jpeg',
    intro: 'FIBCs (Flexible Intermediate Bulk Containers), also known as Jumbo Bags, Big Bags, or Bulk Bags, are the most efficient solution for transporting and storing large volumes of dry, flowable products. Engineered with a Safety Factor of 5:1 or 6:1, our FIBCs undergo rigorous load testing to ensure every bag performs reliably under demanding industrial conditions.',
    detailedContent: 'Our FIBC manufacturing facility produces a comprehensive range of bulk bags including U-Panel, Circular/Tubular, 4-Panel, and Baffle (Q-Bag) designs. Each bag is assembled from heavy-duty PP woven fabric with reinforced lifting loops rated for forklift and crane handling. We offer specialized variants including Type A (standard), Type B (antistatic), Type C (conductive), and Type D (dissipative) for hazardous material handling.',
    features: [
      'Safe Working Load: 500 kg to 2000 kg',
      'Safety Factor 5:1 (single-trip) or 6:1 (multi-trip)',
      'UV stabilized for extended outdoor storage',
      'Conductive & antistatic variants (Type C/D)',
      'Customizable filling/discharge spouts',
      'UN certified for hazardous goods transport'
    ],
    manufacturingSteps: [
      { title: 'Heavy-Duty Extrusion', desc: 'Ultra-thick PP tapes (1800+ denier) extruded for maximum tensile strength and elongation resistance.', icon: Zap },
      { title: 'Panel Weaving', desc: 'Heavy GSM fabric (130–230 g/m²) woven on specialized large-format circular or flat looms.', icon: Settings },
      { title: 'Webbing & Loop Production', desc: 'High-strength PP webbing straps manufactured and tested for 6× rated load capacity.', icon: Layers },
      { title: 'Assembly & Load Testing', desc: 'Manual assembly with reinforced stitching, followed by mandatory proof-load testing per IS 16396.', icon: Shield }
    ],
    finishes: ['U-Panel', 'Circular/Tubular', '4-Panel', 'Baffle (Q-Bag)', 'Conductive Type C', 'UN Certified'],
    applications: ['Mining & Minerals', 'Petrochemicals', 'Construction Materials', 'Food & Agriculture Export', 'Pharmaceutical Powders', 'Waste Management'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Body Fabric', value: 'PP Woven (130 – 230 GSM)' },
        { label: 'Lifting Loops', value: 'PP Webbing (50mm × 4-ply)' },
        { label: 'Seam Thread', value: 'High-Tenacity PP Multifilament' },
        { label: 'Coating', value: 'PE Inner Coating (optional)' },
        { label: 'Liner', value: 'LDPE/HDPE Liner (optional)' },
        { label: 'UV Protection', value: '1600+ hours stabilization' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Standard', 'Heavy Duty', 'Hazmat (Type C)'],
      rows: [
        ['SWL', '500 – 1000 kg', '1000 – 2000 kg', '500 – 1500 kg'],
        ['Safety Factor', '5:1', '6:1', '6:1'],
        ['Fabric GSM', '130 – 170', '170 – 230', '170 – 230'],
        ['Loop Type', '4-Point Cross', '4-Point Tunnel', '4-Point Tunnel'],
        ['Fill Option', 'Open Top / Spout', 'Spout Top', 'Spout Top'],
        ['Discharge', 'Flat / Spout', 'Discharge Spout', 'Discharge Spout'],
      ]
    },
    faqs: [
      { q: 'What is the difference between 5:1 and 6:1 Safety Factor?', a: '5:1 bags are rated for single-trip use — they can hold 5× their rated load before failure. 6:1 bags are designed for multi-trip reuse and can hold 6× their rated load, making them suitable for repeated filling and emptying cycles.' },
      { q: 'Do you offer UN-certified FIBCs?', a: 'Yes, we manufacture UN-certified FIBCs for hazardous materials transport, tested and certified per UN standards for Group I, II, and III dangerous goods.' },
      { q: 'Can FIBCs be used for food-grade products?', a: 'Absolutely. We produce food-grade FIBCs with inner PE liners, manufactured in controlled environments with full traceability and compliance documentation.' }
    ]
  },

  // ─── 5. Geo-Textile Fabrics ───
  'geo-textile': {
    title: 'Geo-Textile Fabrics',
    subtitle: 'High-Strength PP Woven Geotextiles for Civil Engineering & Infrastructure',
    image: '/geo-textile.png',
    heroImage: '/machine/machine 1.jpeg',
    intro: 'PP woven geotextile fabrics are engineered textile materials used in civil engineering, road construction, and environmental applications. Our geotextiles provide critical functions including soil stabilization, separation, filtration, drainage, and erosion control — extending the service life of infrastructure projects while reducing construction costs.',
    detailedContent: 'Manufactured from high-tenacity polypropylene tapes, our geotextile fabrics offer excellent mechanical properties including high tensile strength, puncture resistance, and UV stability. The woven structure provides controlled water permeability while preventing soil migration between layers. Our fabrics are tested per IS 14986 / ASTM D4632 standards.',
    features: [
      'High tensile strength (up to 200 kN/m)',
      'Excellent puncture and tear resistance',
      'Controlled water permeability (CBR)',
      'UV stabilized for 1600+ hours',
      'Chemical and biological resistance',
      'Available in rolls up to 5.2m width'
    ],
    manufacturingSteps: [
      { title: 'Tape Extrusion', desc: 'High-denier PP tapes extruded with UV stabilizers for long-term outdoor durability.', icon: Zap },
      { title: 'Flat Loom Weaving', desc: 'Wide-width flat looms produce fabrics up to 5.2 meters for seamless ground coverage.', icon: Settings },
      { title: 'Surface Treatment', desc: 'Optional calendering or coating for enhanced soil separation properties.', icon: Layers },
      { title: 'Quality Testing', desc: 'Tensile, CBR puncture, and UV resistance testing per IS/ASTM standards.', icon: Shield }
    ],
    finishes: ['Plain Woven', 'Coated', 'High-Strength', 'Permeable', 'UV-Stabilized'],
    applications: ['Road & Highway Construction', 'Railway Track Beds', 'Embankment Stabilization', 'Landfill Lining', 'Coastal Erosion Control', 'Canal Lining'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Material', value: '100% Polypropylene' },
        { label: 'Tape Type', value: 'Slit-Film / Multifilament' },
        { label: 'Fabric Weight', value: '100 – 600 GSM' },
        { label: 'Width', value: '1.0 – 5.2 meters' },
        { label: 'Roll Length', value: '50 – 200 meters' },
        { label: 'UV Stabilization', value: '1600+ hours' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Light Duty', 'Standard', 'Heavy Duty'],
      rows: [
        ['Fabric Weight', '100 – 150 GSM', '150 – 300 GSM', '300 – 600 GSM'],
        ['Tensile Strength', '30 – 50 kN/m', '50 – 100 kN/m', '100 – 200 kN/m'],
        ['Elongation', '15 – 25%', '15 – 22%', '12 – 18%'],
        ['CBR Puncture', '1.5 – 3 kN', '3 – 6 kN', '6 – 12 kN'],
        ['Permeability', 'High', 'Medium', 'Low'],
        ['Application', 'Separation', 'Reinforcement', 'Stabilization'],
      ]
    },
    faqs: [
      { q: 'What is the role of geotextile in road construction?', a: 'Geotextile fabric separates subgrade soil from aggregate base layers, preventing mixing and loss of structural integrity. It also distributes traffic loads, reduces rutting, and extends pavement service life by 2-3×.' },
      { q: 'What width can you produce?', a: 'Our flat looms can produce geotextile fabric up to 5.2 meters width, minimizing the need for overlapping joints in large-scale projects.' }
    ]
  },

  // ─── 6. Flexible Packaging ───
  'flexible-packaging': {
    title: 'Flexible Packaging',
    subtitle: 'Multi-Layer Laminated Films & Pouches for FMCG & Food Industries',
    image: '/flexible-packaging.png',
    heroImage: '/machine/machine3.jpeg',
    intro: 'Flexible packaging represents the fastest-growing segment in the packaging industry. Our multi-layer laminated films and pre-made pouches combine multiple barrier materials to protect products from moisture, oxygen, light, and contamination — all while being lightweight, cost-effective, and visually stunning for retail presentation.',
    detailedContent: 'We offer a comprehensive range of flexible packaging solutions including stand-up pouches (SUP), center-seal pouches, three-side-seal sachets, and roll stock films. Our lamination capabilities include dry lamination, solventless lamination, and extrusion lamination, allowing us to create custom barrier structures tailored to your product requirements.',
    features: [
      'Multi-layer barrier lamination (2–5 layers)',
      'Excellent oxygen and moisture barrier',
      'Stand-up pouches with resealable zippers',
      'High-resolution gravure printing',
      'Custom die-cut shapes and sizes',
      'Eco-friendly recyclable options available'
    ],
    manufacturingSteps: [
      { title: 'Film Selection', desc: 'Engineering the optimal layer structure (PET/MET-PET/PE/AL) based on product barrier requirements.', icon: Layers },
      { title: 'Gravure Printing', desc: 'Photo-quality printing on the primary web using rotogravure with solvent or water-based inks.', icon: Eye },
      { title: 'Lamination', desc: 'Bonding multiple film layers using adhesive lamination (dry/solventless) for barrier integrity.', icon: Settings },
      { title: 'Pouch Making', desc: 'Converting laminated rolls into finished pouches with sealing, zipper insertion, and quality checks.', icon: Box }
    ],
    finishes: ['Glossy', 'Matte', 'Metallic/Holographic', 'Kraft Paper Look', 'Transparent Window', 'Frosted'],
    applications: ['Snacks & Namkeen', 'Spices & Masalas', 'Tea & Coffee', 'Detergent Pods', 'Personal Care Products', 'Pharmaceutical Strips'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Outer Layer', value: 'PET / BOPP / Paper' },
        { label: 'Barrier Layer', value: 'Metalized PET / Aluminium Foil' },
        { label: 'Sealant Layer', value: 'LDPE / LLDPE / CPP' },
        { label: 'Adhesive', value: 'Polyurethane (Solventless)' },
        { label: 'Total Thickness', value: '40 – 200 micron' },
        { label: 'Ink System', value: 'Food-Grade Gravure Inks' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Stand-Up Pouch', 'Center Seal', 'Sachet (3-Side)'],
      rows: [
        ['Layers', '3 – 4', '2 – 3', '2 – 3'],
        ['Barrier', 'High (O₂ + H₂O)', 'Medium – High', 'Standard'],
        ['Size Range', '50g – 5kg', '100g – 2kg', '1g – 100g'],
        ['Zipper', 'Yes (optional)', 'No', 'No'],
        ['Shelf Life', '6 – 24 months', '6 – 18 months', '3 – 12 months'],
        ['MOQ', '10,000 pcs', '25,000 pcs', '50,000 pcs'],
      ]
    },
    faqs: [
      { q: 'What barrier options do you offer?', a: 'We offer standard PE barriers, metalized PET barriers (MVTR < 1 g/m²/day), and aluminium foil barriers (OTR < 0.1 cc/m²/day) for maximum product protection.' },
      { q: 'Can you produce recyclable flexible packaging?', a: 'Yes. We offer mono-material PE and PP based laminates that are compatible with existing recycling streams, as well as paper-based laminates for an eco-friendly positioning.' }
    ]
  },

  // ─── 7. PP Woven Fabrics ───
  'pp-woven-fabrics': {
    title: 'PP Woven Fabrics',
    subtitle: 'Industrial-Grade Polypropylene Woven Fabric Rolls for Diverse Applications',
    image: '/pp-woven-fabrics.png',
    heroImage: '/machine/machin2.jpeg',
    intro: 'PP woven fabric is the foundational material used in manufacturing woven sacks, ground covers, wrapping materials, and geotextiles. We supply PP woven fabric rolls in various GSM, widths, and colors to bag manufacturers, construction companies, and agricultural operations across India and internationally.',
    detailedContent: 'Our fabric manufacturing unit operates 50+ circular looms producing tubular and flat woven fabrics ranging from 40 GSM to 200+ GSM. We offer both uncoated and laminated fabric rolls, with optional UV stabilization and custom colors. Our consistent mesh count and tape quality ensure uniform fabric properties from roll to roll.',
    features: [
      'Wide GSM range: 40 – 200+ g/m²',
      'Tubular and flat woven options',
      'Consistent mesh and tape quality',
      'Custom widths up to 3.6 meters',
      'UV stabilized variants available',
      'Laminated and unlaminated options'
    ],
    manufacturingSteps: [
      { title: 'PP Tape Extrusion', desc: 'Precision extrusion of PP flat tapes with controlled denier, width, and tenacity.', icon: Zap },
      { title: 'Winding', desc: 'Tapes wound onto bobbins with uniform tension for consistent fabric weaving.', icon: Settings },
      { title: 'Circular/Flat Weaving', desc: 'High-speed looms produce fabric rolls with specified mesh count and GSM.', icon: Factory },
      { title: 'Coating (Optional)', desc: 'PE or BOPP lamination applied for moisture barrier and printability.', icon: Layers }
    ],
    finishes: ['Uncoated Natural', 'PE Laminated', 'BOPP Laminated', 'UV Stabilized', 'Colored Fabric', 'Anti-Slip Coated'],
    applications: ['Bag Manufacturing', 'Ground Cover & Mulch', 'Tarpaulins & Covers', 'Flood Control Bags', 'Furniture Wrapping', 'Construction Site Protection'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Material', value: '100% Polypropylene' },
        { label: 'Tape Width', value: '2.0 – 3.5 mm' },
        { label: 'Tape Denier', value: '600 – 1500 D' },
        { label: 'GSM Range', value: '40 – 200+ g/m²' },
        { label: 'Roll Width', value: '30 cm – 3.6 m' },
        { label: 'Roll Length', value: '500 – 5000 m' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Light', 'Standard', 'Heavy Duty'],
      rows: [
        ['GSM', '40 – 60', '60 – 100', '100 – 200+'],
        ['Tensile (Warp)', '15 – 25 kN/m', '25 – 50 kN/m', '50 – 100 kN/m'],
        ['Tensile (Weft)', '12 – 20 kN/m', '20 – 40 kN/m', '40 – 80 kN/m'],
        ['Elongation', '18 – 25%', '15 – 22%', '12 – 18%'],
        ['Mesh Count', '10×10', '12×12', '14×14'],
        ['Color', 'Natural/White', 'Custom', 'Custom'],
      ]
    },
    faqs: [
      { q: 'Do you supply fabric rolls to other bag manufacturers?', a: 'Yes. We are one of the largest suppliers of PP woven fabric rolls to bag converters across India. We offer competitive bulk pricing with consistent quality.' },
      { q: 'What is the maximum roll width you can produce?', a: 'Our circular looms produce tubular fabric up to 180 cm lay-flat width. Our flat looms can produce fabric up to 3.6 meters width for geotextile applications.' }
    ]
  },

  // ─── 8. PP Multifilament Yarn ───
  'pp-multifilament-yarn': {
    title: 'PP Multifilament Yarn',
    subtitle: 'High-Tenacity Polypropylene Yarn for Industrial Sewing & Weaving',
    image: '/pp-yarn.png',
    heroImage: '/machine/machine5.jpeg',
    intro: 'PP multifilament yarn is an essential industrial material used in sewing FIBC bags, weaving narrow fabrics, manufacturing ropes, and producing industrial textiles. Our yarn is manufactured from 100% virgin PP chips and is available in various deniers, twist levels, and colors to meet diverse industrial requirements.',
    detailegContent: 'Our multifilament yarn production lines use melt-spinning technology to produce continuous filament yarns with exceptional uniformity and strength. The yarns undergo drawing, twisting, and heat-setting to achieve the desired tenacity and dimensional stability. We supply yarn on cones, tubes, and bobbins as per customer specifications.',
    features: [
      'High tenacity: up to 7.5 g/denier',
      'Excellent abrasion resistance',
      'Low moisture absorption (< 0.1%)',
      'UV stabilized variants available',
      'Food-grade and colored options',
      'Consistent denier throughout the package'
    ],
    manufacturingSteps: [
      { title: 'Chip Melting', desc: 'Virgin PP chips are melted in an extruder at controlled temperature and pressure.', icon: Thermometer },
      { title: 'Melt Spinning', desc: 'Molten PP is spun through spinnerets to form continuous multifilament yarns.', icon: Zap },
      { title: 'Drawing & Twisting', desc: 'Yarns are drawn for strength and twisted for cohesion and handling properties.', icon: Settings },
      { title: 'Winding', desc: 'Finished yarn is wound onto precision cones or tubes with uniform tension.', icon: Box }
    ],
    finishes: ['Raw White', 'Dyed Colors', 'UV Stabilized', 'High Tenacity', 'Intermingled', 'Twisted (S/Z)'],
    applications: ['FIBC Bag Sewing', 'Webbing & Straps', 'Fishing Nets', 'Ropes & Twines', 'Filter Fabrics', 'Industrial Textiles'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Material', value: '100% Virgin Polypropylene' },
        { label: 'Filament Count', value: '48 – 576 filaments' },
        { label: 'Denier Range', value: '200 – 10,000 D' },
        { label: 'Tenacity', value: '5.5 – 7.5 g/D' },
        { label: 'Elongation', value: '15 – 30%' },
        { label: 'Shrinkage', value: '< 5% at 100°C' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Sewing Grade', 'Webbing Grade', 'Rope Grade'],
      rows: [
        ['Denier', '200 – 1000 D', '1000 – 5000 D', '3000 – 10,000 D'],
        ['Tenacity', '6.0 – 7.0 g/D', '6.5 – 7.5 g/D', '6.0 – 7.0 g/D'],
        ['Twist', '60 – 120 TPM', '40 – 80 TPM', '20 – 60 TPM'],
        ['UV Stability', 'Optional', 'Standard', 'Standard'],
        ['Package Size', '1 – 5 kg cone', '5 – 10 kg bobbin', '10 – 25 kg bobbin'],
        ['Color', 'White/Colored', 'Custom', 'Natural/Black'],
      ]
    },
    faqs: [
      { q: 'What denier ranges do you offer?', a: 'We produce PP multifilament yarn from 200 denier (fine sewing thread) to 10,000 denier (heavy-duty rope and webbing applications).' },
      { q: 'Is your yarn suitable for FIBC sewing?', a: 'Yes, our high-tenacity sewing-grade yarn (6.0+ g/D tenacity) is specifically designed for FIBC bag stitching and meets the strength requirements of IS 16396.' }
    ]
  },

  // ─── 9. Leno Bags ───
  'leno-bags': {
    title: 'Leno Bags',
    subtitle: 'Breathable Mesh Bags for Fresh Produce — Onions, Potatoes & Vegetables',
    image: '/other-bag.png',
    heroImage: '/machine/machine 1.jpeg',
    intro: 'Leno bags (also called mesh bags or net bags) feature an open-weave, knitted mesh construction that provides maximum airflow around packed products. This makes them the ideal packaging choice for fresh agricultural produce like onions, potatoes, garlic, citrus fruits, and firewood, where ventilation is essential to prevent spoilage and extend shelf life.',
    detailedContent: 'Our leno bags are produced on specialized circular leno looms that create a twisted, interlocked mesh pattern. This unique weave structure ensures the bags are lightweight yet exceptionally strong, with excellent visibility of the contents. Available in a rainbow of colors for product differentiation and brand identity at the retail level.',
    features: [
      'Open mesh allows 360° airflow',
      'Prevents moisture buildup and spoilage',
      'Lightweight yet strong (holds 5–50 kg)',
      'Transparent — contents clearly visible',
      'Available in multiple vibrant colors',
      'Drawstring or stitched closure options'
    ],
    manufacturingSteps: [
      { title: 'HDPE/PP Tape Extrusion', desc: 'Fine monofilament or tape extrusion for the mesh fabric weaving process.', icon: Zap },
      { title: 'Leno Weaving', desc: 'Specialized leno looms create the twisted, open-mesh fabric structure.', icon: Settings },
      { title: 'Cutting & Sewing', desc: 'Bags are cut to size and sewn with headers and drawstring closures.', icon: Target },
      { title: 'Labeling & Packing', desc: 'Custom labels attached and bags baled for dispatch.', icon: Box }
    ],
    finishes: ['Red Mesh', 'Orange Mesh', 'Green Mesh', 'Yellow Mesh', 'White Mesh', 'Custom Colors'],
    applications: ['Onions & Potatoes', 'Garlic & Ginger', 'Citrus Fruits', 'Cabbage & Cauliflower', 'Firewood & Kindling', 'Shellfish & Seafood'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Material', value: 'HDPE / PP Monofilament' },
        { label: 'Mesh Opening', value: '5 – 15 mm' },
        { label: 'Fabric Weight', value: '25 – 60 GSM' },
        { label: 'Bag Weight', value: '15 – 80 g/bag' },
        { label: 'Closure', value: 'Drawstring / Header Stitch' },
        { label: 'Label', value: 'Woven / Printed (optional)' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Small', 'Standard', 'Jumbo'],
      rows: [
        ['Capacity', '2 – 10 kg', '10 – 25 kg', '25 – 50 kg'],
        ['Width', '25 – 35 cm', '38 – 50 cm', '50 – 65 cm'],
        ['Length', '40 – 55 cm', '60 – 80 cm', '80 – 100 cm'],
        ['Mesh Size', '5 – 8 mm', '8 – 12 mm', '10 – 15 mm'],
        ['Closure', 'Drawstring', 'Drawstring/Stitch', 'Stitch'],
        ['Color', 'Red/Orange', 'Red/Green/Orange', 'Green/White'],
      ]
    },
    faqs: [
      { q: 'Why are leno bags preferred for vegetables?', a: 'The open mesh structure allows constant airflow, preventing moisture buildup that causes rotting. The transparency also lets buyers inspect product quality without opening the bag.' },
      { q: 'Can you print our branding on leno bags?', a: 'Yes, we can attach custom printed labels or headers to the bags. For larger orders, we can also produce bags in your specific brand colors.' }
    ]
  },

  // ─── 10. BOPP Packaging & Industrial Films ───
  'bopp-packaging-industrial-films': {
    title: 'BOPP Packaging & Industrial Films',
    subtitle: 'High-Performance Oriented Films for Lamination, Printing & Wrapping',
    image: '/bopp-bags-premium.png',
    heroImage: '/machine/machine4.jpeg',
    intro: 'BOPP (Biaxially Oriented Polypropylene) films are high-clarity, high-strength packaging films used for lamination, overwrapping, label printing, and as the outer layer in flexible packaging laminates. The biaxial orientation process stretches the film in both machine and transverse directions, creating a material with exceptional clarity, stiffness, and barrier properties.',
    detailedContent: 'We supply a comprehensive range of BOPP films including plain transparent, heat-sealable, metalized, pearlized, and matte variants. These films serve as the premium outer surface in our BOPP laminated bags and are also available as roll stock for third-party converters and packaging companies.',
    features: [
      'Crystal-clear optical properties (> 92% clarity)',
      'Excellent dimensional stability',
      'Superior moisture and gas barrier',
      'High-speed machinability on converters',
      'Metalized variants for premium shelf appeal',
      'Heat-sealable and non-heat-sealable options'
    ],
    manufacturingSteps: [
      { title: 'PP Extrusion', desc: 'Homopolymer PP is extruded into a thick primary sheet through a flat die.', icon: Zap },
      { title: 'Biaxial Stretching', desc: 'The sheet is stretched 5–7× in both MD and TD directions to orient the polymer molecules.', icon: Ruler },
      { title: 'Surface Treatment', desc: 'Corona or plasma treatment applied for ink adhesion and lamination bonding.', icon: Layers },
      { title: 'Slitting & Rewinding', desc: 'Master rolls are slit to customer-specified widths and rewound for dispatch.', icon: Settings }
    ],
    finishes: ['Plain Transparent', 'Heat Sealable (One Side)', 'Metalized', 'Pearl/Opaque', 'Matte', 'Anti-Fog'],
    applications: ['Bag Lamination', 'Food Wrapping', 'Label Printing', 'Tobacco Packaging', 'Gift Wrapping', 'Tape Manufacturing'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Base Material', value: 'Polypropylene Homopolymer' },
        { label: 'Thickness', value: '12 – 60 micron' },
        { label: 'Density', value: '0.90 – 0.91 g/cm³' },
        { label: 'Haze', value: '< 2% (transparent grades)' },
        { label: 'Gloss', value: '> 90 GU (glossy grades)' },
        { label: 'Surface Treatment', value: 'Corona / Plasma' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Transparent', 'Heat Sealable', 'Metalized'],
      rows: [
        ['Thickness', '12 – 40 µ', '15 – 40 µ', '12 – 25 µ'],
        ['Clarity', '> 92%', '> 90%', 'Opaque (reflective)'],
        ['Tensile (MD)', '> 140 MPa', '> 130 MPa', '> 130 MPa'],
        ['Seal Strength', 'N/A', '> 3 N/15mm', 'N/A'],
        ['MVTR', '< 6 g/m²/day', '< 6 g/m²/day', '< 1 g/m²/day'],
        ['OTR', '< 1600 cc/m²', '< 1600 cc/m²', '< 50 cc/m²'],
      ]
    },
    faqs: [
      { q: 'What thickness range do you offer?', a: 'We supply BOPP films from 12 micron (for lamination) to 60 micron (for rigid overwrap), with standard thickness grades at 15, 20, 25, 30, and 40 micron.' },
      { q: 'Do you supply metalized BOPP film?', a: 'Yes, we offer vacuum-metalized BOPP films with excellent reflectivity and barrier properties for premium snack packaging and decorative applications.' }
    ]
  },

  // ─── 11. Masterbatch ───
  'masterbatch': {
    title: 'Masterbatch Manufacturer',
    subtitle: 'Color, White, Black & Additive Masterbatches for Plastics Processing',
    image: '/masterbatch.png',
    heroImage: '/machine/machine5.jpeg',
    intro: 'Masterbatch is a concentrated mixture of pigments or additives encapsulated in a carrier resin, used to color or modify the properties of raw plastics during the extrusion or molding process. As integrated packaging manufacturers, we produce high-quality masterbatches in-house, ensuring precise color matching and additive performance for all our products.',
    detailedContent: 'Our masterbatch production facility is equipped with twin-screw compounding extruders that ensure uniform pigment dispersion and consistent color output. We produce white, black, color, and additive masterbatches compatible with PP, PE, and HDPE resins. Our in-house lab performs color matching using spectrophotometers to achieve delta E < 1.0 accuracy.',
    features: [
      'Precise color matching (ΔE < 1.0)',
      'Excellent pigment dispersion (no specks)',
      'High loading ratios (up to 70% TiO₂)',
      'Compatible with PP, PE, HDPE, LLDPE',
      'UV, anti-oxidant, anti-static additives',
      'Food-contact compliant grades available'
    ],
    manufacturingSteps: [
      { title: 'Pigment Selection', desc: 'Selecting high-performance pigments and additives based on application requirements.', icon: Droplets },
      { title: 'Compounding', desc: 'Twin-screw extruders blend pigments with carrier resin at controlled temperatures for uniform dispersion.', icon: Settings },
      { title: 'Pelletizing', desc: 'Compounded material is strand-cut into uniform cylindrical pellets for easy handling and dosing.', icon: Box },
      { title: 'Quality Testing', desc: 'Color measurement (spectrophotometer), dispersion check, and compatibility testing.', icon: Eye }
    ],
    finishes: ['White Masterbatch', 'Black Masterbatch', 'Color Masterbatch', 'UV Stabilizer MB', 'Anti-Oxidant MB', 'Filler Masterbatch'],
    applications: ['Woven Sack Extrusion', 'Film Blowing', 'Injection Molding', 'Blow Molding', 'Raffia Tape Lines', 'Pipe Extrusion'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Carrier Resin', value: 'PP / PE / Universal' },
        { label: 'Pigment Loading', value: '20 – 70% (by weight)' },
        { label: 'White (TiO₂)', value: 'Rutile Grade, 50 – 70%' },
        { label: 'Black (Carbon)', value: 'N330/N550, 30 – 50%' },
        { label: 'Form', value: 'Cylindrical Pellets (3×3 mm)' },
        { label: 'Packaging', value: '25 kg PP woven bags' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'White MB', 'Black MB', 'Color MB'],
      rows: [
        ['Pigment Loading', '50 – 70%', '30 – 50%', '20 – 50%'],
        ['Carrier Resin', 'PP / PE', 'PE / PP', 'PP / PE / Universal'],
        ['MFI (g/10min)', '15 – 40', '15 – 35', '10 – 30'],
        ['Dispersion', 'Excellent', 'Excellent', 'Excellent'],
        ['Heat Stability', 'Up to 280°C', 'Up to 300°C', 'Up to 260°C'],
        ['Dosage Rate', '1 – 5%', '1 – 4%', '1 – 5%'],
      ]
    },
    faqs: [
      { q: 'Can you match a specific Pantone color?', a: 'Yes, our color lab can match any Pantone shade or physical sample with a color difference (ΔE) of less than 1.0, which is imperceptible to the human eye.' },
      { q: 'What is the typical dosage rate for masterbatch?', a: 'For white masterbatch, typical dosage is 2–5%. For color masterbatch, it ranges from 1–4%. For black masterbatch, 1–3% is usually sufficient. We recommend specific dosage based on your resin and application.' }
    ]
  },

  // ─── Legacy slugs (backward compatibility) ───
  'hdpe-bags': {
    title: 'HDPE Bags Manufacturer',
    subtitle: 'High-Density Polyethylene Bags for Industrial & Agricultural Packaging',
    image: '/hdpe-bags-premium.png',
    heroImage: '/machine/machine 1.jpeg',
    intro: 'High-Density Polyethylene (HDPE) bags are the backbone of bulk industrial packaging. Known for their exceptional tensile strength, chemical resistance, and durability, HDPE woven sacks provide reliable protection against moisture, dust, and physical damage during storage and transit.',
    detailedContent: 'Our HDPE bags are manufactured using 100% virgin HDPE granules on high-speed circular looms. The resulting fabric offers superior stiffness and crinkle-resistance compared to PP, making HDPE bags ideal for applications where the bag needs to maintain its shape. We offer plain, printed, laminated, and liner-fitted variants to suit every packaging requirement.',
    features: [
      'High tensile strength & tear resistance',
      'Excellent moisture and dust protection',
      'Superior chemical resistance',
      'Lightweight yet holds heavy loads (up to 50 kg)',
      'Available with inner PE liners',
      'Customizable with up to 6-color printing'
    ],
    manufacturingSteps: [
      { title: 'HDPE Extrusion', desc: 'Melting HDPE granules and extruding into high-strength flat tapes through a slit-film process.', icon: Zap },
      { title: 'Circular Weaving', desc: 'High-speed circular looms weave the tapes into tubular fabric with consistent mesh count.', icon: Settings },
      { title: 'Cutting & Stitching', desc: 'Precision cutting to exact dimensions and bottom fold-stitching for maximum seam strength.', icon: Target },
      { title: 'Printing & Finishing', desc: 'Multi-color flexographic printing and optional lamination or liner insertion.', icon: Eye }
    ],
    finishes: ['Plain Unprinted', 'Flexo Printed (up to 6 colors)', 'Gusseted', 'Valve Type', 'PE Lined', 'Laminated'],
    applications: ['Fertilizers', 'Chemicals', 'Cement', 'Food Grains & Sugar', 'Animal Feed', 'Industrial Minerals'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Base Material', value: '100% Virgin HDPE' },
        { label: 'Tape Denier', value: '900 – 1400 D' },
        { label: 'Fabric GSM', value: '55 – 120 g/m²' },
        { label: 'Mesh Count', value: '10×10 to 12×12 per inch' },
        { label: 'Coating', value: 'LDPE (optional)' },
        { label: 'UV Stabilizer', value: '0.5% – 2%' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Standard', 'Heavy Duty', 'Laminated'],
      rows: [
        ['Fabric GSM', '55 – 70', '75 – 100', '85 – 120'],
        ['Load Capacity', '10 – 25 kg', '25 – 50 kg', '25 – 50 kg'],
        ['Width Range', '35 – 65 cm', '45 – 75 cm', '40 – 70 cm'],
        ['Length Range', '60 – 110 cm', '80 – 120 cm', '70 – 115 cm'],
        ['Print Colors', 'Up to 4', 'Up to 6', 'Up to 6'],
        ['Seam Strength', '≥ 800 N', '≥ 1200 N', '≥ 1200 N'],
      ]
    },
    faqs: [
      { q: 'What is the maximum capacity of your HDPE bags?', a: 'Our standard HDPE bags can hold up to 50 kg. For higher capacities, we recommend our FIBC jumbo bags.' },
      { q: 'Are HDPE bags waterproof?', a: 'Standard HDPE bags are moisture-resistant but not fully waterproof. For complete moisture protection, we recommend adding an inner PE liner or PE lamination.' },
      { q: 'What is the difference between HDPE and PP bags?', a: 'HDPE bags are stiffer, have higher chemical resistance, and produce a characteristic crinkle sound. PP bags are slightly softer, have better clarity, and are more commonly used in food packaging.' }
    ]
  },
  'pp-bags': {
    title: 'PP Woven Sacks Manufacturer',
    subtitle: 'Durable Polypropylene Sacks for Heavy Duty Applications',
    image: '/pp-woven-bags.png',
    heroImage: '/machine/machin2.jpeg',
    intro: 'Polypropylene (PP) woven sacks offer superior clarity, strength, and printability compared to standard packaging. They are the preferred choice for industries requiring breathable, strong, and visually appealing packaging solutions.',
    detailedContent: 'PP woven sacks are manufactured from 100% virgin polypropylene and are available in a wide range of sizes, GSMs, and print options. The seamless tubular construction eliminates side-seam weak points. Our PP sacks are FDA-compliant for food contact and offer excellent chemical resistance for industrial applications.',
    features: [
      'Excellent clarity and gloss',
      'Superior puncture resistance',
      '100% reusable and recyclable',
      'Breathable fabric for agricultural products',
      'Resistant to most acids, alkalis, and solvents',
      'FDA compliant for food contact'
    ],
    manufacturingSteps: [
      { title: 'Tape Extrusion', desc: 'High-grade PP granules are extruded into high-strength tapes with consistent denier.', icon: Zap },
      { title: 'Circular Weaving', desc: 'Weaving tapes into seamless tubular fabrics on high-speed circular looms.', icon: Settings },
      { title: 'Finishing', desc: 'Heat cutting to prevent fraying and bottom folding/stitching for strength.', icon: Target },
      { title: 'Printing & Baling', desc: 'Multi-color flexo printing and compression into bales for transportation.', icon: Box }
    ],
    finishes: ['Laminated', 'Unlaminated', 'Perforated (Breathable)', 'Transparent/Translucent', 'Gusseted'],
    applications: ['Flour & Grain', 'Pulses & Spices', 'Salt', 'Seeds', 'Sand & Aggregates', 'Metal Parts'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Base Material', value: '100% Virgin Polypropylene' },
        { label: 'Tape Denier', value: '800 – 1200 D' },
        { label: 'Fabric GSM', value: '50 – 130 g/m²' },
        { label: 'Mesh Count', value: '10×10 to 14×14' },
        { label: 'Lamination', value: 'LDPE / BOPP (optional)' },
        { label: 'Additives', value: 'UV / Anti-Slip (optional)' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Standard', 'Heavy Duty', 'Laminated'],
      rows: [
        ['Fabric GSM', '50 – 70', '75 – 100', '80 – 130'],
        ['Load Capacity', '10 – 25 kg', '25 – 50 kg', '25 – 50 kg'],
        ['Print Colors', 'Up to 4', 'Up to 6', 'Up to 6'],
        ['Width', '35 – 65 cm', '45 – 75 cm', '40 – 70 cm'],
        ['Length', '60 – 110 cm', '80 – 120 cm', '70 – 115 cm'],
        ['Seam Strength', '≥ 800 N', '≥ 1200 N', '≥ 1200 N'],
      ]
    },
    faqs: [
      { q: 'Can you print my logo in multiple colors?', a: 'Yes, we offer high-quality flexographic printing up to 6 colors on PP woven sacks.' },
      { q: 'What is the difference between PP and HDPE?', a: 'PP offers better clarity, is slightly more rigid, and can withstand higher temperatures. HDPE has better chemical resistance and stiffness.' },
      { q: 'What are PP woven sacks used for?', a: 'PP woven sacks are used across agriculture (seeds, grains), chemicals (fertilizers, minerals), construction (cement, plaster), and food industries (flour, sugar, salt).' }
    ]
  },
  'bopp-bags': {
    title: 'BOPP Laminated Bags',
    subtitle: 'Premium Multicolor Printed Packaging for Maximum Brand Impact',
    image: '/bopp-bags-premium.png',
    heroImage: '/machine/machine3.jpeg',
    intro: 'Biaxially Oriented Polypropylene (BOPP) laminated bags represent the pinnacle of retail packaging. By combining the strength of a woven sack with the photographic print quality of BOPP film, these bags ensure your product stands out on the shelf while remaining fully protected.',
    detailedContent: 'Our BOPP bag manufacturing process uses rotogravure printing for photographic-quality graphics, followed by extrusion lamination to permanently bond the printed film to the PP woven substrate. The ink is protected between the film and fabric layers, making it completely scratch-proof and waterproof.',
    features: [
      'Photographic, high-resolution print quality',
      'Reverse printing (ink is protected)',
      'Excellent moisture barrier',
      'High gloss or premium matte finishes',
      'Extremely durable and tear-resistant',
      'Easy to clean and handle'
    ],
    manufacturingSteps: [
      { title: 'Rotogravure Printing', desc: 'Reverse printing onto BOPP film for photographic quality and scratch-proof graphics.', icon: Eye },
      { title: 'Extrusion Lamination', desc: 'Bonding the printed BOPP film to PP woven fabric using a PE adhesive layer.', icon: Layers },
      { title: 'Tubing & Gusseting', desc: 'Forming the tube and creating side gussets for volume expansion.', icon: Target },
      { title: 'Cutting & Sewing', desc: 'Finalizing bag shape with heavy-duty stitching or heat sealing.', icon: Box }
    ],
    finishes: ['High Gloss', 'Matte Finish', 'Metallic/Pearl', 'Window Panel', 'Anti-Slip'],
    applications: ['Premium Pet Food', 'Rice & Premium Grains', 'Specialty Fertilizers', 'Wall Putty', 'Detergents'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Outer Film', value: 'BOPP (20–40 micron)' },
        { label: 'Adhesive', value: 'LDPE Extrusion Coat' },
        { label: 'Base Fabric', value: 'PP Woven (60–100 GSM)' },
        { label: 'Print', value: 'Rotogravure (up to 8 colors)' },
        { label: 'Inner Liner', value: 'PE (optional)' },
        { label: 'Finish', value: 'Gloss / Matte / Metallic' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Standard', 'Premium', 'Block Bottom'],
      rows: [
        ['Total GSM', '80 – 110', '100 – 140', '110 – 150'],
        ['Capacity', '5 – 25 kg', '10 – 50 kg', '10 – 50 kg'],
        ['Print Quality', '120 LPI', '150 LPI', '150 LPI'],
        ['Finish', 'Gloss', 'Gloss/Matte', 'Gloss/Matte'],
        ['MOQ', '10,000', '10,000', '15,000'],
        ['Lead Time', '15 – 20 days', '20 – 25 days', '20 – 25 days'],
      ]
    },
    faqs: [
      { q: 'What is the MOQ for custom BOPP bags?', a: 'Due to the rotogravure printing process and cylinder setup, our standard MOQ for custom BOPP bags is 10,000 pieces.' },
      { q: 'How many colors can you print?', a: 'We print up to 8 colors using rotogravure, including CMYK process and Pantone spot colors for precise brand matching.' }
    ]
  },
  'polypropylene-bulk-bags': {
    title: 'FIBC Jumbo Bags Manufacturer',
    subtitle: 'Flexible Intermediate Bulk Containers (500 kg to 2000 kg Capacity)',
    image: '/fibc-bags.png',
    heroImage: '/machine/machin2.jpeg',
    intro: 'FIBCs, commonly known as Jumbo Bags or Bulk Bags, are the ultimate solution for transporting large volumes of dry, flowable products. Engineered for safety and efficiency, our bags handle loads from 500 kg up to 2000 kg with ease.',
    detailedContent: 'Our FIBC manufacturing facility produces a full range of bulk bags including U-Panel, Circular, 4-Panel, and Baffle designs. Each bag is assembled from heavy-duty PP woven fabric with reinforced lifting loops rated for forklift and crane handling. Rigorous proof-load testing ensures safety compliance.',
    features: [
      'Safe Working Load: 500 kg to 2000 kg',
      'Safety Factor 5:1 or 6:1 available',
      'UV stabilized for outdoor storage',
      'Customizable lifting loops and spouts',
      'Conductive variants for hazmat (Type C/D)',
      'UN certified for dangerous goods'
    ],
    manufacturingSteps: [
      { title: 'Heavy Duty Extrusion', desc: 'Ultra-thick tapes for maximum tensile strength.', icon: Zap },
      { title: 'Panel Weaving', desc: 'Heavy GSM fabric on specialized large-format looms.', icon: Settings },
      { title: 'Webbing Production', desc: 'Creating high-strength lifting loops and reinforcements.', icon: Layers },
      { title: 'Assembly & Testing', desc: 'Manual assembly followed by mandatory proof-load testing.', icon: Shield }
    ],
    finishes: ['U-Panel', 'Circular/Tubular', '4-Panel', 'Baffle Bags', 'Conductive Type C', 'UN Certified'],
    applications: ['Mining & Minerals', 'Petrochemicals', 'Construction', 'Agriculture Export', 'Pharmaceuticals', 'Waste Management'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Body Fabric', value: 'PP Woven (130–230 GSM)' },
        { label: 'Lifting Loops', value: 'PP Webbing (50mm × 4-ply)' },
        { label: 'Thread', value: 'PP Multifilament' },
        { label: 'Liner', value: 'LDPE/HDPE (optional)' },
        { label: 'UV Protection', value: '1600+ hours' },
        { label: 'Coating', value: 'PE Inner (optional)' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Standard', 'Heavy Duty', 'Type C'],
      rows: [
        ['SWL', '500 – 1000 kg', '1000 – 2000 kg', '500 – 1500 kg'],
        ['Safety Factor', '5:1', '6:1', '6:1'],
        ['Fabric GSM', '130 – 170', '170 – 230', '170 – 230'],
        ['Fill Option', 'Open/Spout', 'Spout', 'Spout'],
        ['Discharge', 'Flat/Spout', 'Spout', 'Spout'],
        ['Certification', 'IS 16396', 'IS 16396', 'IEC 61340'],
      ]
    },
    faqs: [
      { q: 'What is the difference between 5:1 and 6:1 Safety Factor?', a: '5:1 bags are for single-trip use. 6:1 bags are designed for multi-trip reuse, with greater safety margin for repeated filling cycles.' },
      { q: 'Do you offer UN-certified FIBCs?', a: 'Yes, we manufacture UN-certified FIBCs for hazardous materials transport, compliant with international regulations.' }
    ]
  },
  'jute-bags': {
    title: 'Jute Bags & Gunny Sacks',
    subtitle: 'Traditional, 100% Eco-Friendly and Biodegradable Packaging',
    image: '/jute-bag.png',
    heroImage: '/manufacturing.jpg',
    intro: 'Jute bags (Gunny sacks) represent the traditional, environmentally responsible choice for packaging. Completely biodegradable and highly breathable, they remain the gold standard for specific agricultural commodities that need constant aeration.',
    detailedContent: 'Made from natural jute fibers, these bags are 100% biodegradable, sustainable, and eco-friendly. Their high-friction surface prevents slipping during stacking, and the breathable fabric prevents moisture buildup. Ideal for government procurement programs and organic/eco-conscious brands.',
    features: [
      '100% natural and biodegradable',
      'Excellent breathability prevents moisture',
      'High friction — prevents slipping when stacked',
      'Highly durable and reusable',
      'Zero synthetic microplastics',
      'Maintains product freshness longer'
    ],
    manufacturingSteps: [
      { title: 'Fiber Selection', desc: 'Premium raw jute fibers selected and graded for quality.', icon: Leaf },
      { title: 'Spinning', desc: 'Natural fibers spun into strong jute yarn.', icon: Settings },
      { title: 'Weaving', desc: 'Yarn woven into hessian or sacking cloth.', icon: Target },
      { title: 'Finishing', desc: 'Cutting, sewing with food-grade oil treatment, and printing.', icon: Box }
    ],
    finishes: ['A-Twill', 'B-Twill', 'Hessian Cloth', 'Food Grade (VOT)', 'Hydrocarbon Free', 'Bleached'],
    applications: ['Potatoes & Onions', 'Coffee Beans', 'Cocoa', 'Nuts & Dry Fruits', 'Tobacco', 'Export Grains'],
    materialComposition: {
      title: 'Material Composition',
      items: [
        { label: 'Material', value: '100% Natural Jute Fiber' },
        { label: 'Weave', value: 'A-Twill / B-Twill / Hessian' },
        { label: 'Weight', value: '270 – 610 g/m²' },
        { label: 'Width', value: '42 – 112 cm' },
        { label: 'Thread', value: 'Jute / Cotton' },
        { label: 'Treatment', value: 'VOT / HC-Free' }
      ]
    },
    specsTable: {
      headers: ['Parameter', 'Hessian', 'A-Twill', 'B-Twill'],
      rows: [
        ['Weight', '270 – 370 GSM', '380 – 500 GSM', '500 – 610 GSM'],
        ['Capacity', '25 – 50 kg', '50 – 100 kg', '80 – 112 kg'],
        ['Width', '42 – 60 cm', '55 – 75 cm', '65 – 112 cm'],
        ['Use', 'Light goods', 'Grains/Coffee', 'Heavy commodities'],
        ['Breathability', 'High', 'High', 'Medium'],
        ['Reusability', '3 – 5 cycles', '5 – 8 cycles', '8 – 12 cycles'],
      ]
    },
    faqs: [
      { q: 'Are your jute bags food grade?', a: 'Yes, we offer Vegetable Oil Treated (VOT) jute bags that are completely hydrocarbon-free and safe for direct food contact.' },
      { q: 'Do you export jute bags?', a: 'Yes, we export high-quality jute sacks globally, complying with international packaging regulations.' }
    ]
  }
};

// ─── FAQ COMPONENT ───────────────────────────────────────────────
const FAQItem = ({ faq }: { faq: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden transition-colors hover:bg-white/10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 lg:px-8 py-6 flex items-center justify-between text-left gap-4"
      >
        <span className="text-lg lg:text-xl font-bold">{faq.q}</span>
        <ChevronDown className={`w-6 h-6 text-[#00C878] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 lg:px-8 pb-6 text-white/70 leading-relaxed border-t border-white/5 pt-6">
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── STAT COUNTER ────────────────────────────────────────────────
const StatCounter = ({ value, suffix, label }: { value: number, suffix: string, label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="text-center p-6">
      <div className="text-4xl lg:text-5xl font-black text-white mb-2">
        {isInView ? <CountUp end={value} duration={2.5} separator="," /> : '0'}
        <span className="text-[#00C878]">{suffix}</span>
      </div>
      <div className="text-xs font-bold text-white/50 uppercase tracking-widest">{label}</div>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function CategoryDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [apiCategory, setApiCategory] = useState<any>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCategoryAndProducts = async () => {
      try {
        setIsLoadingCategory(true);
        setIsLoading(true);
        const categories = await api.categories.getAll();
        const foundCategory = Array.isArray(categories) 
          ? categories.find((c: any) => c.slug === slug || c._id === slug || c.name?.toLowerCase().replace(/\s+/g, '-') === slug)
          : null;
        if (foundCategory) setApiCategory(foundCategory);

        const allProducts = await api.products.getAll();
        const prodList = Array.isArray(allProducts) ? allProducts : (allProducts as any)?.data || [];
        const filtered = prodList.filter((p: any) => {
          if (!slug) return false;
          if (foundCategory && (p.category === foundCategory._id || p.category?._id === foundCategory._id)) return true;
          const catName = (typeof p.category === 'string' ? p.category : p.category?.name || '').toLowerCase();
          const prodName = (p.name || '').toLowerCase();
          const matches = (term: string, antiTerm?: string) => {
            const hasTerm = catName.includes(term) || prodName.includes(term);
            if (antiTerm) return hasTerm && !catName.includes(antiTerm) && !prodName.includes(antiTerm);
            return hasTerm;
          };
          if (slug.includes('hdpe')) return matches('hdpe');
          if (slug.includes('bopp') && slug.includes('block')) return matches('block');
          if (slug.includes('bopp') && slug.includes('film')) return matches('bopp') || matches('film');
          if (slug.includes('bopp')) return matches('bopp');
          if (slug === 'pp-bags' || slug === 'pp-woven-bags') return matches('pp', 'bopp') && !matches('bulk') && !matches('fabric') && !matches('yarn');
          if (slug.includes('bulk') || slug.includes('fibc')) return matches('bulk') || matches('fibc') || matches('jumbo');
          if (slug.includes('jute')) return matches('jute');
          if (slug.includes('geo')) return matches('geo');
          if (slug.includes('flexible')) return matches('flexible') || matches('pouch') || matches('film');
          if (slug.includes('fabric')) return matches('fabric');
          if (slug.includes('yarn') || slug.includes('multifilament')) return matches('yarn') || matches('multifilament');
          if (slug.includes('leno')) return matches('leno') || matches('mesh') || matches('net');
          if (slug.includes('masterbatch')) return matches('masterbatch') || matches('color');
          return false;
        });
        setProducts(filtered);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoadingCategory(false);
        setIsLoading(false);
      }
    };
    fetchCategoryAndProducts();
  }, [slug]);

  const fallback = slug && categoryContentData[slug] ? categoryContentData[slug] : null;
  const content = apiCategory ? {
    title: apiCategory.name,
    subtitle: apiCategory.description || fallback?.subtitle || `Premium ${apiCategory.name} solutions`,
    image: apiCategory.categoryImage || apiCategory.image || fallback?.image,
    heroImage: fallback?.heroImage || '/manufacturing.jpg',
    intro: fallback?.intro || apiCategory.description || `Explore our high-quality ${apiCategory.name}.`,
    detailedContent: fallback?.detailedContent || '',
    features: apiCategory.features || fallback?.features || ['High Quality', 'Durable', 'Cost Effective'],
    manufacturingSteps: fallback?.manufacturingSteps || [],
    finishes: fallback?.finishes || [],
    applications: fallback?.applications || [],
    materialComposition: fallback?.materialComposition || null,
    specsTable: fallback?.specsTable || null,
    faqs: fallback?.faqs || []
  } : fallback;

  if (isLoadingCategory) {
    return (
      <>
        <Navbar />
        <div className="pt-32 pb-20 text-center min-h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#00C878] rounded-full animate-spin"></div>
            <span className="font-bold text-gray-400 uppercase tracking-widest text-sm">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (!content) {
    return (
      <>
        <Navbar />
        <div className="pt-32 pb-20 text-center min-h-[60vh] flex flex-col items-center justify-center bg-white">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-4">Category Not Found</h1>
          <Link to="/categories" className="text-[#00C878] font-bold hover:underline">Return to Categories</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{content.title} - Sundar Corporation</title>
        <meta name="description" content={content.intro?.substring(0, 160)} />
      </Helmet>
      <Navbar />
      <main className="relative z-10">

        {/* ══════════════ HERO ══════════════ */}
        <section className="relative min-h-[75vh] lg:min-h-[85vh] flex items-center justify-center bg-[#0f172a] text-white overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 12, ease: "easeOut" }}
              src={content.heroImage || '/manufacturing.jpg'} 
              alt="" 
              className="w-full h-full object-cover opacity-25" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-[#0f172a]/40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center gap-2 text-[10px] font-bold text-[#00C878] tracking-[0.2em] uppercase mb-8"
                >
                  <Link to="/" className="hover:text-white transition-colors">HOME</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link to="/categories" className="hover:text-white transition-colors">PRODUCTS</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-white/60">{slug?.replace(/-/g, ' ').toUpperCase()}</span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-6"
                >
                  {content.title}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg lg:text-xl text-white/70 max-w-xl mb-10 leading-relaxed font-medium"
                >
                  {content.subtitle}
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-wrap gap-4"
                >
                  <a href="#products" className="bg-[#00C878] hover:bg-[#00A865] text-[#0f172a] px-8 py-4 rounded-full font-bold transition-all shadow-[0_0_40px_rgba(0,200,120,0.2)] flex items-center gap-2 group text-sm tracking-[0.1em] uppercase">
                    Explore Products <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <Link to="/contact" className="bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold transition-all text-sm tracking-[0.1em] uppercase">
                    Get Quote
                  </Link>
                </motion.div>
              </div>

              {/* Hero Product Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="hidden lg:flex items-center justify-center"
              >
                <div className="relative">
                  <div className="w-80 h-80 xl:w-96 xl:h-96 rounded-full bg-[#00C878]/10 flex items-center justify-center backdrop-blur-sm border border-[#00C878]/20">
                    <img src={content.image} alt={content.title} className="w-64 h-64 xl:w-80 xl:h-80 object-contain drop-shadow-2xl" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-[#0f172a] border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-md">
                    <div className="text-[#00C878] text-xs font-bold uppercase tracking-widest">Quality Assured</div>
                    <div className="text-white font-black text-lg">ISO 9001:2015</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════ INTRODUCTION ══════════════ */}
        <section className="py-20 lg:py-28 bg-white relative">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
              <div className="lg:col-span-7">
                <div className="text-xs font-bold text-[#00C878] tracking-[0.2em] uppercase mb-4">Introduction</div>
                <h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] tracking-tight leading-tight mb-8">
                  Engineered for <span className="text-[#00C878]">Performance.</span>
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">{content.intro}</p>
                {content.detailedContent && (
                  <p className="text-gray-500 leading-relaxed">{content.detailedContent}</p>
                )}
              </div>
              <div className="lg:col-span-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.features.map((feature: string, idx: number) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08 }}
                      className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-[#00C878]/30 hover:shadow-lg transition-all group"
                    >
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:bg-[#00C878] transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-[#00C878] group-hover:text-white transition-colors" />
                      </div>
                      <h4 className="font-bold text-[#0f172a] text-sm leading-snug">{feature}</h4>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ MATERIAL COMPOSITION ══════════════ */}
        {content.materialComposition && (
          <section className="py-20 lg:py-28 bg-gray-50">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="text-xs font-bold text-[#00C878] tracking-[0.2em] uppercase mb-4">Technical Data</div>
                  <h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] tracking-tight mb-6">
                    {content.materialComposition.title}
                  </h2>
                  <p className="text-gray-500 leading-relaxed mb-8">
                    Detailed breakdown of the raw materials and specifications that go into manufacturing our {content.title?.toLowerCase()}.
                  </p>
                  <Link to="/contact" className="inline-flex items-center gap-2 text-[#00C878] font-bold text-sm uppercase tracking-widest hover:text-[#0f172a] transition-colors group">
                    Request Full Datasheet <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {content.materialComposition.items.map((item: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08 }}
                      className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                    >
                      <span className="font-bold text-[#0f172a] text-sm">{item.label}</span>
                      <span className="text-gray-500 text-sm font-medium text-right">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════ MANUFACTURING PROCESS ══════════════ */}
        {content.manufacturingSteps.length > 0 && (
          <section className="py-20 lg:py-28 bg-[#0f172a] text-white overflow-hidden relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00C878]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
              <div className="mb-16 text-center">
                <div className="text-xs font-bold text-[#00C878] tracking-[0.2em] uppercase mb-4">Production</div>
                <h2 className="text-3xl lg:text-5xl font-black tracking-tight">How It's Made</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.manufacturingSteps.map((step: any, idx: number) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.12 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-500 relative group h-full flex flex-col"
                  >
                    <div className="text-6xl font-black text-white/[0.03] absolute -top-2 -right-1 select-none pointer-events-none">0{idx + 1}</div>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#00C878] transition-colors duration-500 border border-white/10">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-white/60 leading-relaxed text-sm flex-grow">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════ SPECIFICATIONS TABLE ══════════════ */}
        {content.specsTable && (
          <section className="py-20 lg:py-28 bg-white">
            <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
              <div className="text-center mb-16">
                <div className="text-xs font-bold text-[#00C878] tracking-[0.2em] uppercase mb-4">Technical Specifications</div>
                <h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] tracking-tight">Product Specifications</h2>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="overflow-x-auto pb-4"
              >
                <div className="min-w-[700px] bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="bg-[#0f172a]">
                        {content.specsTable.headers.map((header: string, idx: number) => (
                          <th key={idx} className={`py-5 px-6 font-bold text-sm uppercase tracking-widest border-b border-white/10 ${idx === 0 ? 'text-left text-white' : 'text-white/90 border-l border-white/10'}`}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {content.specsTable.rows.map((row: string[], rIdx: number) => (
                        <tr key={rIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          {row.map((cell: string, cIdx: number) => (
                            <td key={cIdx} className={`py-4 px-6 text-sm ${cIdx === 0 ? 'text-left font-bold text-[#0f172a] bg-gray-50/50 uppercase tracking-wider text-xs' : 'font-medium text-gray-600 border-l border-gray-100'}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ══════════════ FINISHES & APPLICATIONS ══════════════ */}
        <section className="py-20 lg:py-28 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
              {content.finishes.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-[#00C878] tracking-[0.2em] uppercase mb-4">Customization</div>
                  <h2 className="text-3xl lg:text-4xl font-black text-[#0f172a] tracking-tight mb-8">Available Finishes</h2>
                  <div className="flex flex-wrap gap-3">
                    {content.finishes.map((finish: string, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-200 px-5 py-3 rounded-full flex items-center gap-2.5 hover:border-[#00C878] hover:shadow-md transition-all cursor-default group">
                        <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-[#00C878] transition-colors"></div>
                        <span className="font-bold text-[#0f172a] text-sm">{finish}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {content.applications.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-[#00C878] tracking-[0.2em] uppercase mb-4">Industries We Serve</div>
                  <h2 className="text-3xl lg:text-4xl font-black text-[#0f172a] tracking-tight mb-8">Applications</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {content.applications.map((app: string, idx: number) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center gap-4 hover:shadow-lg hover:border-[#00C878]/30 transition-all">
                        <div className="w-10 h-10 bg-[#00C878]/10 text-[#00C878] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Factory className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[#0f172a] text-sm">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════ PRODUCTS GRID ══════════════ */}
        <section id="products" className="py-20 lg:py-28 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <div className="text-xs font-bold text-[#00C878] tracking-[0.2em] uppercase mb-4">Product Range</div>
                <h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] tracking-tight">Explore The Collection</h2>
              </div>
              <Link to="/products" className="inline-flex items-center gap-2 text-xs font-bold text-[#00C878] tracking-[0.2em] uppercase hover:text-[#0f172a] transition-colors group">
                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl"></div>)}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/products/${product.id}`}
                    className="group relative bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full"
                  >
                    <div className="aspect-square relative p-8 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <ImagePlaceholder className="rounded-2xl" />
                      )}
                    </div>
                    <div className="p-6 pt-0 flex flex-col flex-grow bg-white">
                      <div className="pt-6 border-t border-gray-100 flex-grow flex flex-col">
                        <h3 className="text-lg font-black text-[#0f172a] mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
                          {product.description || "Industrial-grade packaging solution."}
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0f172a] tracking-widest uppercase group-hover:text-[#00C878] transition-colors mt-auto">
                          View Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-16 rounded-2xl border border-gray-100 text-center">
                <Box className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-[#0f172a] mb-4">Products Coming Soon</h3>
                <p className="text-gray-500 font-medium">We are currently updating our catalog for this category. Contact us for availability.</p>
                <Link to="/contact" className="inline-flex items-center gap-2 mt-6 text-[#00C878] font-bold text-sm uppercase tracking-widest hover:text-[#0f172a] transition-colors group">
                  Contact Sales <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════ GLOBAL REACH ══════════════ */}
        <section className="py-20 lg:py-28 bg-[#0f172a] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-xs font-bold text-[#00C878] tracking-[0.2em] uppercase mb-4">Supply Network</div>
                <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-8">Pan-India Delivery & Export</h2>
                <p className="text-white/60 leading-relaxed mb-10 text-lg">
                  From our manufacturing facility in Indore, Madhya Pradesh, we supply {content.title?.toLowerCase()} to businesses across India and export to international markets. Our logistics network ensures on-time delivery to every corner of the country.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCounter value={1500} suffix="+" label="Clients Served" />
                  <StatCounter value={28} suffix="+" label="States Covered" />
                  <StatCounter value={98} suffix="%" label="On-Time Rate" />
                  <StatCounter value={7} suffix="+" label="Years Experience" />
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="w-8 h-8 text-[#00C878]" />
                    <h3 className="text-xl font-bold">Key Markets</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Chhattisgarh', 'Bihar', 'Export Markets'].map((region, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-white/70 text-sm font-medium">
                        <MapPin className="w-3 h-3 text-[#00C878] flex-shrink-0" />
                        {region}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ FAQS ══════════════ */}
        {content.faqs.length > 0 && (
          <section className="py-20 lg:py-28 bg-[#08131F] text-white">
            <div className="max-w-[900px] mx-auto px-6 lg:px-12">
              <div className="text-center mb-16">
                <div className="text-xs font-bold text-[#00C878] tracking-[0.2em] uppercase mb-4">Support</div>
                <h2 className="text-3xl lg:text-5xl font-black tracking-tight">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-4">
                {content.faqs.map((faq: any, idx: number) => (
                  <FAQItem key={idx} faq={faq} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════ CTA ══════════════ */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-[1000px] mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] tracking-tight mb-6">
              Need Custom <span className="text-[#00C878]">{content.title?.split(' ')[0]}</span>?
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              Share your specifications and our team will provide a detailed quotation with samples within 48 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="bg-[#00C878] hover:bg-[#00A865] text-[#0f172a] px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest transition-colors shadow-xl flex items-center gap-2 group">
                Get a Quote <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/products" className="bg-gray-100 hover:bg-gray-200 text-[#0f172a] px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest transition-colors">
                Browse All Products
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
