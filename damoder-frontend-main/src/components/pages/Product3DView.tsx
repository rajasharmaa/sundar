import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, MeshDistortMaterial, Float, MeshWobbleMaterial, Html } from '@react-three/drei';
import { Loader2, AlertTriangle } from 'lucide-react';
import * as THREE from 'three';

interface Product3DViewProps {
    productName: string;
    category: string;
}

const ProductModel = ({ category }: { category: string }) => {
    // Simple geometric representations for various industrial categories
    if (category.toLowerCase().includes('valve')) {
        return (
            <group>
                <mesh position={[0, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
                    <meshStandardMaterial color="#4A5568" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.7, 0.7, 0.4, 16]} />
                    <meshStandardMaterial color="#2D3748" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 1.2, 0]} castShadow>
                    <torusGeometry args={[0.4, 0.1, 8, 32]} />
                    <meshStandardMaterial color="#E53E3E" metalness={0.5} roughness={0.5} />
                </mesh>
            </group>
        );
    }

    if (category.toLowerCase().includes('fitting')) {
        return (
            <group>
                <mesh position={[0, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.4, 0.4, 1.5, 16]} />
                    <meshStandardMaterial color="#718096" metalness={0.7} roughness={0.3} />
                </mesh>
                <mesh position={[0.4, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.4, 0.4, 1, 16]} />
                    <meshStandardMaterial color="#718096" metalness={0.7} roughness={0.3} />
                </mesh>
            </group>
        );
    }

    // Default "Industrial" shape
    return (
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh castShadow>
                <boxGeometry args={[1.2, 1.2, 1.2]} />
                <MeshWobbleMaterial factor={0.05} speed={0.5} color="#3182CE" metalness={0.8} roughness={0.2} />
            </mesh>
        </Float>
    );
};

const WebGLMonitor = () => {
    const gl = useThree((state) => state.gl);
    const [contextLost, setContextLost] = useState(false);
    
    useEffect(() => {
        const canvas = gl.domElement;
        
        const handleContextLost = (event: Event) => {
            event.preventDefault();
            // Silently handle in production, log in development
            if (process.env.NODE_ENV === 'development') {
                console.warn('WebGL context lost');
            }
            setContextLost(true);
        };
        
        const handleContextRestored = () => {
            // Silently handle in production, log in development
            if (process.env.NODE_ENV === 'development') {
                console.info('WebGL context restored');
            }
            setContextLost(false);
        };
        
        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);
        
        return () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        };
    }, [gl]);
    
    if (contextLost) {
        return (
            <Html center>
                <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>WebGL context lost. Refresh to restore.</span>
                </div>
            </Html>
        );
    }
    
    return null;
};

const VisibilityDetector = ({ onVisibleChange }: { onVisibleChange: (visible: boolean) => void }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    
    useFrame(() => {
        if (meshRef.current) {
            try {
                const rect = meshRef.current.userData.element.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                onVisibleChange(isVisible);
            } catch (error) {
                // Fallback to always visible if detection fails
                onVisibleChange(true);
            }
        }
    });
    
    return (
        <mesh ref={meshRef} position={[0, 0, -10]}>
            <planeGeometry args={[0.1, 0.1]} />
            <meshBasicMaterial transparent opacity={0} />
        </mesh>
    );
};

const Product3DView: React.FC<Product3DViewProps> = ({ productName, category }) => {
    const [webGLError, setWebGLError] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Detect WebGL support
    useEffect(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            setWebGLError(true);
            // Silently handle in production, log in development
            if (process.env.NODE_ENV === 'development') {
                console.warn('WebGL not supported');
            }
        }
    }, []);
    
    // Pause animation when not visible
    const handleVisibilityChange = useCallback((visible: boolean) => {
        setIsVisible(visible);
    }, []);
    
    if (webGLError) {
        return (
            <div className="w-full h-[400px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden relative border border-gray-700 shadow-2xl flex items-center justify-center">
                <div className="text-center text-white p-6">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                    <h3 className="text-xl font-bold mb-2">WebGL Not Available</h3>
                    <p className="text-gray-300 mb-4">Your browser doesn't support WebGL or it's disabled.</p>
                    <div className="text-sm text-gray-400">
                        <p>{productName}</p>
                        <p className="mt-1">Category: {category}</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div 
            ref={containerRef}
            className="w-full h-[400px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden relative border border-gray-700 shadow-2xl"
        >
            <div className="absolute top-4 left-4 z-10 text-white/60 pointer-events-none">
                <h3 className="text-lg font-bold text-white">{productName}</h3>
                <p className="text-sm">Interactive 3D Engineering Model</p>
            </div>

            <div className="absolute bottom-4 right-4 z-10 text-white/40 text-xs pointer-events-none">
                Drag to Rotate • Scroll to Zoom
            </div>

            <Suspense fallback={
                <div className="flex items-center justify-center w-full h-full text-white bg-gray-900">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            }>
                <Canvas 
                    shadows 
                    dpr={[1, 2]}
                    frameloop={isVisible ? "always" : "demand"}
                    onCreated={(state) => {
                        // Optimize for mobile and reduce resource usage
                        state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                        state.gl.setSize(containerRef.current?.clientWidth || 400, 400);
                        // Reduce power preference for mobile devices
                        state.gl.getContext().getExtension('WEBGL_lose_context');
                    }}
                >
                    <WebGLMonitor />
                    <VisibilityDetector onVisibleChange={handleVisibilityChange} />
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                    <ambientLight intensity={isVisible ? 0.5 : 0.2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={isVisible ? 1 : 0.3} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={isVisible ? 0.5 : 0.1} />

                    <Stage environment="city" intensity={isVisible ? 0.5 : 0.2}>
                        <ProductModel category={category} />
                    </Stage>

                    <OrbitControls 
                        makeDefault 
                        autoRotate={isVisible}
                        autoRotateSpeed={0.5}
                        enableZoom={true}
                        enablePan={false}
                        maxDistance={10}
                        minDistance={3}
                    />
                </Canvas>
            </Suspense>
        </div>
    );
};

export default Product3DView;
