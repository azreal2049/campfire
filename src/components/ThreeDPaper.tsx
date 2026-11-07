import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface ThreeDPaperProps {
  word?: string
  className?: string
}

export function ThreeDPaper({ word = 'NOCTURNE', className }: ThreeDPaperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    if (!canvasRef.current) return

    // Create a canvas for the word texture with depth-of-field blur
    const wordCanvas = document.createElement('canvas')
    wordCanvas.width = 1024
    wordCanvas.height = 512
    const wordContext = wordCanvas.getContext('2d')!

    // Draw the word with a slight blur for depth-of-field effect
    wordContext.font = 'bold 200px sans-serif'
    wordContext.textAlign = 'center'
    wordContext.textBaseline = 'middle'
    wordContext.fillStyle = 'white'
    wordContext.filter = 'blur(3px)'
    wordContext.fillText(word, 512, 256)
    wordContext.filter = 'none'

    const wordTexture = new THREE.CanvasTexture(wordCanvas)

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create a plane with custom shader
    const geometry = new THREE.PlaneGeometry(2, 2)

    // Custom shader for paper effect with word
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uWordTexture: { value: wordTexture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        uniform sampler2D uWordTexture;

        // Simple noise function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          vec2 st = gl_FragCoord.xy / uResolution;
          
          // Base paper color
          vec3 paperColor = vec3(0.05, 0.05, 0.06);
          
          // Sample word texture
          vec4 wordSample = texture2D(uWordTexture, st);
          
          // Add grain
          float grain = noise(st * 1000.0) * 0.1;
          paperColor += grain;
          
          // Vignette
          vec2 vignette = st * (1.0 - st);
          float v = vignette.x * vignette.y;
          paperColor *= (1.0 - v * 0.5);
          
          // Cursor light
          float lightDist = distance(st, uMouse);
          float light = exp(-lightDist * 5.0) * 0.3;
          paperColor += light;
          
          // Mix word with paper
          vec3 finalColor = mix(paperColor, wordSample.rgb, wordSample.a * 0.8);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Animation loop
    let animationId: number
    const animate = () => {
      material.uniforms.uTime.value += 0.01
      material.uniforms.uMouse.value.set(mouse.x, 1.0 - mouse.y)
      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      wordTexture.dispose()
    }
  }, [mouse, word])

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  )
}