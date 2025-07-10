import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';


let audioContext, isPlaying = false;
let musicVolume = 0.4;

const audioControls = {
    init: async () => {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            createSpaceOdysseyAmbient();
            console.log('Space Odyssey ambient audio initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    },
    
    toggle: () => {
        if (isPlaying) {
            audioContext.suspend();
            isPlaying = false;
        } else {
                audioContext.resume();
            isPlaying = true;
        }
        updateUI();
    },
    
    setVolume: (volume) => {
        musicVolume = Math.max(0, Math.min(1, volume));
        updateUI();
    }
};

const createSpaceOdysseyAmbient = () => {
    const masterGain = audioContext.createGain();
    masterGain.gain.value = musicVolume;
    

    const createLongDelay = () => {
        const delay = audioContext.createDelay();
        delay.delayTime.value = 8.0; // 8 second delay
        
        const delayGain = audioContext.createGain();
        delayGain.gain.value = 0.4; // Delay feedback
        

        delay.connect(delayGain);
        delayGain.connect(delay);
        
        return { delay, delayGain };
    };
    

    const createReverb = () => {
        const convolver = audioContext.createConvolver();
        const impulseLength = audioContext.sampleRate * 4; // 4 second reverb (longer)
        const impulse = audioContext.createBuffer(2, impulseLength, audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < impulseLength; i++) {
                channelData[i] = (Math.random() - 0.5) * 2 * Math.exp(-i / (impulseLength * 0.15));
            }
        }
        
        convolver.buffer = impulse;
        return convolver;
    };
    
    const { delay, delayGain } = createLongDelay();
    const reverb = createReverb();
    const reverbGain = audioContext.createGain();
    reverbGain.gain.value = 0.4; // Increased reverb mix
    

    delay.connect(reverb);
    reverb.connect(reverbGain);
    reverbGain.connect(masterGain);
    masterGain.connect(audioContext.destination);
    

    const createCosmicWind = () => {
        const windNoise = audioContext.createBufferSource();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        

        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() - 0.5) * (0.3 + Math.random() * 0.4);
        }
        
        const windFilter = audioContext.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.value = 150 + Math.random() * 100; // Random base frequency
        windFilter.Q.value = 0.3 + Math.random() * 0.4;
        
        const windGain = audioContext.createGain();
        windGain.gain.value = 0.02 + Math.random() * 0.02;
        
        windNoise.buffer = buffer;
        windNoise.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(masterGain);
        windGain.connect(delay); // Add delay
        windNoise.start();
        windNoise.loop = true;
        

        const modulateWind = () => {
            const newFreq = 100 + Math.random() * 200;
            const modTime = 3 + Math.random() * 4;
            windFilter.frequency.exponentialRampToValueAtTime(newFreq, audioContext.currentTime + modTime);
            setTimeout(modulateWind, modTime * 1000);
        };
        setTimeout(modulateWind, 1000 + Math.random() * 2000);
    };
    
    createCosmicWind();
    

    const createResonance = () => {
        const baseFreq = 20 + Math.random() * 40; // Random low frequency
        const resonance = audioContext.createOscillator();
        resonance.frequency.value = baseFreq;
        resonance.type = Math.random() > 0.5 ? 'sine' : 'triangle';
        
        const resonanceGain = audioContext.createGain();
        resonanceGain.gain.value = 0.06 + Math.random() * 0.04;
        

        const resonance2 = audioContext.createOscillator();
        resonance2.frequency.value = baseFreq + (Math.random() - 0.5) * 2;
        resonance2.type = resonance.type;
        
        const resonance2Gain = audioContext.createGain();
        resonance2Gain.gain.value = 0.03 + Math.random() * 0.02;
        
        resonance.connect(resonanceGain);
        resonance2.connect(resonance2Gain);
        resonanceGain.connect(masterGain);
        resonance2Gain.connect(masterGain);
        resonanceGain.connect(delay);
        resonance2Gain.connect(delay);
        resonance.start();
        resonance2.start();
        

        const driftResonance = () => {
            const newFreq = baseFreq + (Math.random() - 0.5) * 10;
            const driftTime = 8 + Math.random() * 12;
            resonance.frequency.exponentialRampToValueAtTime(newFreq, audioContext.currentTime + driftTime);
            resonance2.frequency.exponentialRampToValueAtTime(newFreq + (Math.random() - 0.5) * 2, audioContext.currentTime + driftTime);
            setTimeout(driftResonance, driftTime * 1000);
        };
        setTimeout(driftResonance, 5000 + Math.random() * 5000);
    };
    
    createResonance();
    

    const createHarmonic = () => {
        const harmonicFreqs = [82.4, 110, 146.8, 196, 220]; // E, A, D, G, A
        const harmonic = audioContext.createOscillator();
        harmonic.frequency.value = harmonicFreqs[Math.floor(Math.random() * harmonicFreqs.length)];
        harmonic.type = Math.random() > 0.5 ? 'triangle' : 'sine';
        
        const harmonicGain = audioContext.createGain();
        harmonicGain.gain.value = 0.015 + Math.random() * 0.01;
        
        harmonic.connect(harmonicGain);
        harmonicGain.connect(masterGain);
        harmonicGain.connect(delay);
        harmonic.start();
        

        const changeHarmonic = () => {
            const newFreq = harmonicFreqs[Math.floor(Math.random() * harmonicFreqs.length)];
            const changeTime = 10 + Math.random() * 15;
            harmonic.frequency.exponentialRampToValueAtTime(newFreq, audioContext.currentTime + changeTime);
            setTimeout(changeHarmonic, changeTime * 1000);
        };
        setTimeout(changeHarmonic, 8000 + Math.random() * 10000);
    };
    
    createHarmonic();
    

    const createCosmicEvent = () => {
        const event = audioContext.createOscillator();
        const startFreq = 200 + Math.random() * 400;
        event.frequency.value = startFreq;
        event.type = Math.random() > 0.5 ? 'sine' : 'sawtooth';
        
        const eventGain = audioContext.createGain();
        eventGain.gain.value = 0.01 + Math.random() * 0.01;
        

        const duration = 2 + Math.random() * 4;
        const endFreq = 40 + Math.random() * 40;
        event.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);
        eventGain.gain.setValueAtTime(0, audioContext.currentTime);
        eventGain.gain.linearRampToValueAtTime(eventGain.gain.value, audioContext.currentTime + 0.1 + Math.random() * 0.2);
        eventGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        event.connect(eventGain);
        eventGain.connect(masterGain);
        eventGain.connect(delay);
        event.start();
        event.stop(audioContext.currentTime + duration);
        

        setTimeout(createCosmicEvent, 6000 + Math.random() * 20000);
    };
    
    setTimeout(createCosmicEvent, 3000 + Math.random() * 4000);
    

    const createRadioWhisper = () => {
        const whisper = audioContext.createOscillator();
        const baseFreq = 300 + Math.random() * 300;
        whisper.frequency.value = baseFreq;
        whisper.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
        
        const whisperFilter = audioContext.createBiquadFilter();
        whisperFilter.type = 'bandpass';
        whisperFilter.frequency.value = baseFreq;
        whisperFilter.Q.value = 1 + Math.random() * 3;
        
        const whisperGain = audioContext.createGain();
        whisperGain.gain.value = 0.004 + Math.random() * 0.004;
        

        const duration = 0.5 + Math.random() * 1.0;
        whisperGain.gain.setValueAtTime(0, audioContext.currentTime);
        whisperGain.gain.linearRampToValueAtTime(whisperGain.gain.value, audioContext.currentTime + 0.05 + Math.random() * 0.1);
        whisperGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        whisper.connect(whisperFilter);
        whisperFilter.connect(whisperGain);
        whisperGain.connect(masterGain);
        whisperGain.connect(delay);
        whisper.start();
        whisper.stop(audioContext.currentTime + duration);
        

        setTimeout(createRadioWhisper, 4000 + Math.random() * 12000);
    };
    
    setTimeout(createRadioWhisper, 2000 + Math.random() * 3000);
};

const createUI = () => {
    const musicButton = document.createElement('button');
    musicButton.textContent = '🎵';
    musicButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 12px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        z-index: 1000;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    musicButton.onclick = audioControls.toggle;
    document.body.appendChild(musicButton);
    
    window.musicButton = musicButton;
};

const updateUI = () => {
    if (window.musicButton) {
        window.musicButton.textContent = isPlaying ? '🔇' : '🎵';
        window.musicButton.style.background = isPlaying ? 
            'rgba(0, 255, 0, 0.3)' : 'rgba(0, 0, 0, 0.7)';
    }
};

let scene, camera, renderer, controls;
let earth, mars, satellites = [];
let marsSatellites = [];
const SATELLITE_COUNT = 16;
const MARS_SATELLITE_COUNT = 8; // Fewer satellites for Mars
const EARTH_RADIUS = 2;
const MARS_RADIUS = 1.1; // Mars is smaller than Earth
const MARS_DISTANCE = 12; // Distance from Earth to Mars
const LEO_RADIUS = 3.5; // LEO ~200-2000km above Earth, scale for demo
const MARS_LEO_RADIUS = 2.5; // Mars LEO radius (increased to move satellites further out)
const container = document.getElementById('earth-container');
let commLines = [];
let groundStations = [];
let marsGroundStations = [];
let groundCommLines = [];
let marsGroundCommLines = [];

let satelliteCommStates = {}; // Track communication states for satellite pairs
let marsSatelliteCommStates = {}; // Track communication states for Mars satellite pairs
let groundCommStates = {}; // Track communication states for ground station pairs
let marsGroundCommStates = {}; // Track communication states for Mars ground station pairs
let evilSatellite, evilTargetIdx = 0, evilFollowTime = 0, evilTargetTime = 0;
let evilGroundStation;
let evilBeam, evilRadarCone, evilGroundLine;
let marsEvilSatellite, marsEvilTargetIdx = 0, marsEvilFollowTime = 0, marsEvilTargetTime = 0;
let marsEvilBeam, marsEvilRadarCone;
let remoteSensingSatellites = [], remoteSensingTimes = [], remoteSensingDurations = [], isRemoteSensing = [];
let remoteSensingBeams = [], remoteSensingCones = [];
let marsRemoteSensingSatellites = [], marsRemoteSensingTimes = [], marsRemoteSensingDurations = [], marsIsRemoteSensing = [];
let marsRemoteSensingBeams = [], marsRemoteSensingCones = [];
let evilSatelliteLights = [];
let marsEvilSatelliteLights = [];
let earthLaserStation1, earthLaserStation2, marsLaserStation1, marsLaserStation2;
let earthMarsLaserBeam;
let earthToMarsSpacecraft, marsToEarthSpacecraft;
let spacecraftBeams = [];
let spacecraftLights = [];
let starSystem; // Global reference to star system for animation


audioControls.init().then(() => {
    createUI();
    init();
    animate();
    

    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
        isPlaying = true;
        updateUI();
    }
    
}).catch(error => {
    console.warn('Audio initialization failed, continuing without music:', error);
    init();
    animate();
});

function init() {

    scene = new THREE.Scene();
    

    const createStarSystem = () => {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 5000; // Number of stars
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {

            const radius = 50 + Math.random() * 100; // Stars between 50-150 units away
            const theta = Math.random() * Math.PI * 2; // Random angle around Y axis
            const phi = Math.acos(2 * Math.random() - 1); // Random angle from Y axis
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            

            const colorChoices = [
                [1.0, 1.0, 1.0],   // White
                [0.8, 0.9, 1.0],   // Blue-white
                [1.0, 1.0, 0.8],   // Yellow-white
                [1.0, 0.9, 0.7],   // Orange-white
                [1.0, 0.8, 0.6]    // Red-orange
            ];
            const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
            
            colors[i * 3] = color[0];
            colors[i * 3 + 1] = color[1];
            colors[i * 3 + 2] = color[2];
            

            sizes[i] = 0.1 + Math.random() * 0.3;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        

        const starMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + 0.1 * sin(time * 2.0 + position.x * 0.1));
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    if (distance > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const starSystem = new THREE.Points(starGeometry, starMaterial);
        return starSystem;
    };
    

    starSystem = createStarSystem();
    scene.add(starSystem);
    

    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(6, 7, 11); // Restore initial position for best view

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.minDistance = 8; // Increased minimum distance
    controls.maxDistance = 30; // Increased maximum distance
    controls.target.set(6, 0, 0); // Keep target between Earth and Mars

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 3, 5);
    scene.add(dir);

    const earthTexture = new THREE.TextureLoader().load('8081_earthmap2k.jpg');
    earthTexture.minFilter = THREE.LinearFilter;
    earthTexture.magFilter = THREE.LinearFilter;
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const earthMat = new THREE.MeshPhongMaterial({map: earthTexture});
    earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 128, 128), earthMat);
    scene.add(earth);
    

    const marsTexture = new THREE.TextureLoader().load('mar0kuu2.jpg');
    marsTexture.minFilter = THREE.LinearFilter;
    marsTexture.magFilter = THREE.LinearFilter;
    marsTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const marsMat = new THREE.MeshPhongMaterial({
        map: marsTexture,
        color: 0xff8866, // Lighter, more subtle red-orange tint
        shininess: 20
    });
    mars = new THREE.Mesh(new THREE.SphereGeometry(MARS_RADIUS, 64, 64), marsMat);
    mars.position.set(MARS_DISTANCE, 0, 0); // Position to the right of Earth
    scene.add(mars);
    

    satellites = [];
    for (let i = 0; i < SATELLITE_COUNT; i++) {
        const sat = createSatellite();
        sat.userData = {
            inclination: Math.random() * Math.PI, // 0 to 180 deg
            node: Math.random() * Math.PI * 2,    // 0 to 360 deg
            phase: Math.random() * Math.PI * 2,
            speed: 0.2 + Math.random() * 0.15 // Same speed as Mars satellites: 0.2-0.35 radians/sec
        };
        scene.add(sat);
        satellites.push(sat);
    }
    

    marsSatellites = [];
    for (let i = 0; i < MARS_SATELLITE_COUNT; i++) {
        const sat = createSatellite();
        sat.userData = {
            inclination: Math.random() * Math.PI, // 0 to 180 deg
            node: Math.random() * Math.PI * 2,    // 0 to 360 deg
            phase: Math.random() * Math.PI * 2,
            speed: 0.2 + Math.random() * 0.15 // Slightly slower than Earth satellites
        };

        sat.position.set(MARS_DISTANCE, 0, 0);
        scene.add(sat);
        marsSatellites.push(sat);
    }
    

    groundStations = [];
    const latitudes = [-60, -30, 0, 30, 60];
    const stationsPerLatitude = 8;
    for (let i = 0; i < latitudes.length; i++) {
        const lat = latitudes[i];
        for (let j = 0; j < stationsPerLatitude; j++) {
            const lon = (360 / stationsPerLatitude) * j;
            groundStations.push(createGroundStation(lat, lon));
        }
    }
    

    marsGroundStations = [];
    const marsLatitudes = [-45, 0, 45];
    const marsStationsPerLatitude = 4;
    for (let i = 0; i < marsLatitudes.length; i++) {
        const lat = marsLatitudes[i];
        for (let j = 0; j < marsStationsPerLatitude; j++) {
            const lon = (360 / marsStationsPerLatitude) * j;
            marsGroundStations.push(createGroundStation(lat, lon, false, true)); // true for Mars
        }
    }
    

    earthLaserStation1 = createLaserStation(false); // false for Earth
    earthLaserStation1.position.set(0, EARTH_RADIUS + 0.02, 0.1); // North pole of Earth, further to the right
    scene.add(earthLaserStation1);
    
    earthLaserStation2 = createLaserStation(false); // false for Earth
    earthLaserStation2.position.set(0, EARTH_RADIUS + 0.02, -0.1); // North pole of Earth, further to the left
    scene.add(earthLaserStation2);
    

    marsLaserStation1 = createLaserStation(true); // true for Mars
    marsLaserStation1.position.set(MARS_DISTANCE, MARS_RADIUS + 0.02, 0.1); // North pole of Mars, further to the right
    scene.add(marsLaserStation1);
    
    marsLaserStation2 = createLaserStation(true); // true for Mars
    marsLaserStation2.position.set(MARS_DISTANCE, MARS_RADIUS + 0.02, -0.1); // North pole of Mars, further to the left
    scene.add(marsLaserStation2);
    

    

    earthToMarsSpacecraft = createSpacecraft(false); // false for Earth to Mars
    earthToMarsSpacecraft.position.set(MARS_DISTANCE * 0.3, 0, 0); // Start 30% of the way to Mars
    earthToMarsSpacecraft.visible = false; // Make invisible
    scene.add(earthToMarsSpacecraft);
    
    marsToEarthSpacecraft = createSpacecraft(true); // true for Mars to Earth
    marsToEarthSpacecraft.position.set(MARS_DISTANCE * 0.7, 0, 0); // Start 70% of the way to Mars
    marsToEarthSpacecraft.visible = false; // Make invisible
    scene.add(marsToEarthSpacecraft);
    

    const createSpacecraftLights = (spacecraft, isMarsToEarth) => {
        const lights = [];
        

        const redLight = new THREE.PointLight(0xff0000, 0, 2);
        redLight.position.set(0, 0, isMarsToEarth ? -0.25 : 0.25);
        spacecraft.add(redLight);
        lights.push(redLight);
        

        const greenLight = new THREE.PointLight(0x00ff00, 0, 2);
        greenLight.position.set(0, 0, isMarsToEarth ? 0.25 : -0.25);
        spacecraft.add(greenLight);
        lights.push(greenLight);
        

        const strobeLight = new THREE.PointLight(0xffffff, 0, 3);
        strobeLight.position.set(0, 0.3, 0);
        spacecraft.add(strobeLight);
        lights.push(strobeLight);
        

        const statusLight = new THREE.PointLight(0x0088ff, 0, 1.5);
        statusLight.position.set(isMarsToEarth ? -0.35 : 0.35, 0, 0);
        spacecraft.add(statusLight);
        lights.push(statusLight);
        
        return lights;
    };
    
    spacecraftLights.push(createSpacecraftLights(earthToMarsSpacecraft, false));
    spacecraftLights.push(createSpacecraftLights(marsToEarthSpacecraft, true));
    

    evilGroundStation = createGroundStation(0, 0, true);
    groundStations.push(evilGroundStation);
    groundStations.forEach(gs => scene.add(gs));
    marsGroundStations.forEach(gs => scene.add(gs));

    evilSatellite = createEvilSatellite();
    scene.add(evilSatellite);
    evilTargetIdx = Math.floor(Math.random() * satellites.length);
    evilFollowTime = 0;
    evilTargetTime = 7 + Math.random() * 3; // 7-10 seconds
    

    const createEvilLights = (satellite) => {
        const lights = [];
        

        const targetLight = new THREE.PointLight(0xff0000, 0, 4);
        targetLight.position.set(0.1, 0, 0);
        satellite.add(targetLight);
        lights.push(targetLight);
        

        const leftWarning = new THREE.PointLight(0xff0000, 0, 3);
        leftWarning.position.set(0, 0, 0.1);
        satellite.add(leftWarning);
        lights.push(leftWarning);
        
        const rightWarning = new THREE.PointLight(0xff0000, 0, 3);
        rightWarning.position.set(0, 0, -0.1);
        satellite.add(rightWarning);
        lights.push(rightWarning);
        

        const jammingLight = new THREE.PointLight(0xff6600, 0, 2.5);
        jammingLight.position.set(0, 0.1, 0);
        satellite.add(jammingLight);
        lights.push(jammingLight);
        
        return lights;
    };
    
    evilSatelliteLights = createEvilLights(evilSatellite);
    

    marsEvilSatellite = createEvilSatellite();
    marsEvilSatellite.position.set(MARS_DISTANCE, 0, 0); // Start at Mars position
    scene.add(marsEvilSatellite);
    marsEvilTargetIdx = Math.floor(Math.random() * marsSatellites.length);
    marsEvilFollowTime = 0;
    marsEvilTargetTime = 7 + Math.random() * 3; // 7-10 seconds
    
    marsEvilSatelliteLights = createEvilLights(marsEvilSatellite);
    

    const numRemoteSensing = Math.floor(satellites.length / 2);
    for (let i = 0; i < numRemoteSensing; i++) {
        remoteSensingSatellites.push(satellites[i]);
        remoteSensingTimes.push(Math.random() * 30); // Random initial start time (0-30 seconds)
        remoteSensingDurations.push(0);
        isRemoteSensing.push(false);
    }
    

    const numMarsRemoteSensing = Math.floor(marsSatellites.length / 2);
    for (let i = 0; i < numMarsRemoteSensing; i++) {
        marsRemoteSensingSatellites.push(marsSatellites[i]);
        marsRemoteSensingTimes.push(Math.random() * 30); // Random initial start time (0-30 seconds)
        marsRemoteSensingDurations.push(0);
        marsIsRemoteSensing.push(false);
    }
    

    const createBackgroundText = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 1024;
        canvas.height = 128;
        

        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        

        context.font = 'bold 28px "Times New Roman", serif';
        context.fillStyle = 'rgba(255, 255, 255, 0.95)'; // Crisp white
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Center for Secure and Reliable Space Communications', canvas.width / 2, canvas.height / 2 - 8);
        

        context.font = 'italic 18px "Times New Roman", serif';
        context.fillStyle = 'rgba(255, 255, 255, 0.85)';
        context.fillText('(CSC)', canvas.width / 2, canvas.height / 2 + 12);
        

        const flagWidth = 50;
        const flagHeight = 30;
        const flagX = canvas.width / 2 + 400; // Position further to the right of text
        const flagY = canvas.height / 2;
        

        context.fillStyle = '#FF0000'; // Bright red
        context.fillRect(flagX - flagWidth/2, flagY - flagHeight/2, flagWidth, flagHeight);
        

        context.fillStyle = '#FFFFFF';
        context.fillRect(flagX - flagWidth/2 + flagWidth * 0.3, flagY - flagHeight/2, flagWidth * 0.15, flagHeight);
        

        context.fillRect(flagX - flagWidth/2, flagY - flagHeight/2 + flagHeight * 0.4, flagWidth, flagHeight * 0.2);
        

        context.fillStyle = '#00205B'; // Norwegian blue
        context.fillRect(flagX - flagWidth/2 + flagWidth * 0.35, flagY - flagHeight/2, flagWidth * 0.05, flagHeight);
        

        context.fillRect(flagX - flagWidth/2, flagY - flagHeight/2 + flagHeight * 0.45, flagWidth, flagHeight * 0.1);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const geometry = new THREE.PlaneGeometry(40, 5);
        const textPlane = new THREE.Mesh(geometry, material);
        

        textPlane.position.set(6, 0, -25);
        textPlane.rotation.x = -Math.PI / 8; // Gentler tilt
        
        return textPlane;
    };
    
    const backgroundText = createBackgroundText();
    scene.add(backgroundText);
    

    const uibLogoTexture = new THREE.TextureLoader().load('uib_logo.png');
    uibLogoTexture.minFilter = THREE.LinearFilter;
    uibLogoTexture.magFilter = THREE.LinearFilter;
    uibLogoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    
    const uibLogoMaterial = new THREE.MeshBasicMaterial({
        map: uibLogoTexture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });
    

    const uibLogoGeometry = new THREE.PlaneGeometry(6, 3); // Bigger size for better visibility
    const uibLogoPlane = new THREE.Mesh(uibLogoGeometry, uibLogoMaterial);
    

    uibLogoPlane.position.set(32, 0, -25); // Closer to the Norwegian flag
    uibLogoPlane.rotation.x = -Math.PI / 8; // Same tilt as main text
    
    scene.add(uibLogoPlane);
    




    window.addEventListener('resize', onWindowResize, false);
    

}

function createSatellite() {
    const satellite = new THREE.Group();


    const bodyGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x666666,
        shininess: 80,
        specular: 0x222222
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    body.rotation.x = Math.PI / 2;
    satellite.add(body);


    const thermalPanelGeom = new THREE.BoxGeometry(0.16, 0.01, 0.04);
    const thermalMat = new THREE.MeshPhongMaterial({ 
        color: 0x444444,
        shininess: 20,
        specular: 0x111111
    });
    

    const topPanel = new THREE.Mesh(thermalPanelGeom, thermalMat);
    topPanel.position.y = 0.05;
    satellite.add(topPanel);
    

    const bottomPanel = new THREE.Mesh(thermalPanelGeom, thermalMat);
    bottomPanel.position.y = -0.05;
    satellite.add(bottomPanel);


    const createSolarPanel = (position) => {
        const panelGroup = new THREE.Group();
        

        const frameGeom = new THREE.BoxGeometry(0.18, 0.02, 0.06);
        const frameMat = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            shininess: 60,
            specular: 0x222222
        });
        const frame = new THREE.Mesh(frameGeom, frameMat);
        panelGroup.add(frame);
        

        const cellSize = 0.025;
        const cellSpacing = 0.002;
        const startY = -0.025;
        const startZ = -0.075;
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 6; col++) {
                const cellGeom = new THREE.BoxGeometry(cellSize, 0.001, cellSize);
                const cellMat = new THREE.MeshPhongMaterial({ 
                    color: 0x2244aa,
                    emissive: 0x112244,
                    shininess: 120,
                    specular: 0x666666
                });
                const cell = new THREE.Mesh(cellGeom, cellMat);
                cell.position.y = startY + row * (cellSize + cellSpacing);
                cell.position.z = startZ + col * (cellSize + cellSpacing);
                cell.position.x = 0.011;
                panelGroup.add(cell);
                

                if (col < 5) {
                    const interconnectGeom = new THREE.BoxGeometry(cellSpacing, 0.0005, cellSize * 0.8);
                    const interconnectMat = new THREE.MeshPhongMaterial({ 
                        color: 0xcccccc,
                        shininess: 100,
                        specular: 0x888888
                    });
                    const interconnect = new THREE.Mesh(interconnectGeom, interconnectMat);
                    interconnect.position.y = startY + row * (cellSize + cellSpacing);
                    interconnect.position.z = startZ + col * (cellSize + cellSpacing) + cellSize + cellSpacing/2;
                    interconnect.position.x = 0.0115;
                    panelGroup.add(interconnect);
                }
            }
        }
        

        const bracketGeom = new THREE.BoxGeometry(0.02, 0.01, 0.06);
        const bracketMat = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            shininess: 70
        });
        
        const leftBracket = new THREE.Mesh(bracketGeom, bracketMat);
        leftBracket.position.z = -0.1;
        leftBracket.position.y = -0.005;
        panelGroup.add(leftBracket);
        
        const rightBracket = new THREE.Mesh(bracketGeom, bracketMat);
        rightBracket.position.z = 0.1;
        rightBracket.position.y = -0.005;
        panelGroup.add(rightBracket);
        

        const edgeGeom = new THREE.BoxGeometry(0.18, 0.005, 0.005);
        const edgeMat = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            shininess: 50
        });
        
        const topEdge = new THREE.Mesh(edgeGeom, edgeMat);
        topEdge.position.y = 0.0325;
        panelGroup.add(topEdge);
        
        const bottomEdge = new THREE.Mesh(edgeGeom, edgeMat);
        bottomEdge.position.y = -0.0325;
        panelGroup.add(bottomEdge);
        
        panelGroup.position.copy(position);
        return panelGroup;
    };
    
    const leftPanel = createSolarPanel(new THREE.Vector3(0, 0, -0.13));
    satellite.add(leftPanel);

    const rightPanel = createSolarPanel(new THREE.Vector3(0, 0, 0.13));
    satellite.add(rightPanel);


    const boomGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.12, 8);
    const boomMat = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        shininess: 60
    });
    
    const leftBoom = new THREE.Mesh(boomGeom, boomMat);
    leftBoom.position.z = -0.19;
    leftBoom.rotation.x = Math.PI / 2;
    satellite.add(leftBoom);
    
    const rightBoom = new THREE.Mesh(boomGeom, boomMat);
    rightBoom.position.z = 0.19;
    rightBoom.rotation.x = Math.PI / 2;
    satellite.add(rightBoom);


    const dishGeom = new THREE.SphereGeometry(0.03, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.5);
    const dishMat = new THREE.MeshPhongMaterial({ 
        color: 0xcccccc,
        shininess: 120,
        specular: 0x666666
    });
    const dish = new THREE.Mesh(dishGeom, dishMat);
    dish.position.y = 0.09;
    dish.rotation.z = Math.PI;
    satellite.add(dish);


    const hornGeom = new THREE.CylinderGeometry(0.005, 0.005, 0.04, 8);
    const hornMat = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        shininess: 80
    });
    const horn = new THREE.Mesh(hornGeom, hornMat);
    horn.position.y = 0.11;
    horn.rotation.z = Math.PI / 2;
    satellite.add(horn);


    const patchGeom = new THREE.BoxGeometry(0.02, 0.01, 0.02);
    const patchMat = new THREE.MeshPhongMaterial({ 
        color: 0x444444,
        shininess: 40
    });
    
    const leftPatch = new THREE.Mesh(patchGeom, patchMat);
    leftPatch.position.z = -0.08;
    leftPatch.position.y = 0.06;
    satellite.add(leftPatch);
    
    const rightPatch = new THREE.Mesh(patchGeom, patchMat);
    rightPatch.position.z = 0.08;
    rightPatch.position.y = 0.06;
    satellite.add(rightPatch);


    const trackerGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8);
    const trackerMat = new THREE.MeshPhongMaterial({ 
        color: 0x222222,
        shininess: 100,
        specular: 0x111111
    });
    const tracker = new THREE.Mesh(trackerGeom, trackerMat);
    tracker.position.y = -0.08;
    tracker.rotation.z = Math.PI / 2;
    satellite.add(tracker);


    const sunSensorGeom = new THREE.BoxGeometry(0.01, 0.01, 0.01);
    const sunSensorMat = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 60
    });
    const sunSensor = new THREE.Mesh(sunSensorGeom, sunSensorMat);
    sunSensor.position.z = 0.06;
    sunSensor.position.y = -0.06;
    satellite.add(sunSensor);


    const wheelGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8);
    const wheelMat = new THREE.MeshPhongMaterial({ 
        color: 0x555555,
        shininess: 70
    });
    
    const wheel1 = new THREE.Mesh(wheelGeom, wheelMat);
    wheel1.position.z = -0.02;
    wheel1.position.y = 0.02;
    wheel1.rotation.x = Math.PI / 2;
    satellite.add(wheel1);
    
    const wheel2 = new THREE.Mesh(wheelGeom, wheelMat);
    wheel2.position.z = 0.02;
    wheel2.position.y = 0.02;
    wheel2.rotation.x = Math.PI / 2;
    satellite.add(wheel2);


    const thrusterGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8);
    const thrusterMat = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 50
    });
    
    const thruster1 = new THREE.Mesh(thrusterGeom, thrusterMat);
    thruster1.position.z = -0.08;
    thruster1.position.y = -0.06;
    thruster1.rotation.x = Math.PI / 2;
    satellite.add(thruster1);
    
    const thruster2 = new THREE.Mesh(thrusterGeom, thrusterMat);
    thruster2.position.z = 0.08;
    thruster2.position.y = -0.06;
    thruster2.rotation.x = Math.PI / 2;
    satellite.add(thruster2);
    

    satellite.rotation.y = Math.PI / 6; // 30 degrees rotation
    satellite.rotation.z = Math.PI / 12; // 15 degrees tilt

    return satellite;
}

function animate() {
    requestAnimationFrame(animate);
    

    if (starSystem && starSystem.material) {
        starSystem.material.uniforms.time.value = performance.now() / 1000;
    }
    

    const t = performance.now()/1000;
    satellites.forEach(sat => {
        const { inclination, node, phase, speed } = sat.userData;

        const theta = phase + t * speed;


        let x1 = LEO_RADIUS * Math.cos(theta);
        let y1 = LEO_RADIUS * Math.sin(theta);
        let z1 = 0;


        let x2 = x1;
        let y2 = y1 * Math.cos(inclination) - z1 * Math.sin(inclination);
        let z2 = y1 * Math.sin(inclination) + z1 * Math.cos(inclination);


        let x = x2 * Math.cos(node) - y2 * Math.sin(node);
        let y = x2 * Math.sin(node) + y2 * Math.cos(node);
        let z = z2;

        sat.position.set(x, y, z);
    });


    marsSatellites.forEach(sat => {
        const { inclination, node, phase, speed } = sat.userData;

        const theta = phase + t * speed;


        let x1 = MARS_LEO_RADIUS * Math.cos(theta);
        let y1 = MARS_LEO_RADIUS * Math.sin(theta);
        let z1 = 0;


        let x2 = x1;
        let y2 = y1 * Math.cos(inclination) - z1 * Math.sin(inclination);
        let z2 = y1 * Math.sin(inclination) + z1 * Math.cos(inclination);


        let x = x2 * Math.cos(node) - y2 * Math.sin(node);
        let y = x2 * Math.sin(node) + y2 * Math.cos(node);
        let z = z2;


        sat.position.set(x + MARS_DISTANCE, y, z);
    });


    evilFollowTime += 1/60;
    if (evilFollowTime > evilTargetTime) {

        let newIdx;
        do {
            newIdx = Math.floor(Math.random() * satellites.length);
        } while (newIdx === evilTargetIdx);
        evilTargetIdx = newIdx;
        evilFollowTime = 0;
        evilTargetTime = 7 + Math.random() * 3;
    }
    const targetSat = satellites[evilTargetIdx];
    

    const earthTargetPos = targetSat.position.clone();
    const earthEvilPos = evilSatellite.position.clone();
    const earthDirectionToTarget = earthTargetPos.clone().sub(earthEvilPos).normalize();
    const earthDesiredDistance = 0.4; // Increased distance (same as Mars evil satellite)
    const earthDesiredPos = earthTargetPos.clone().sub(earthDirectionToTarget.clone().multiplyScalar(earthDesiredDistance));
    

    evilSatellite.position.lerp(earthDesiredPos, 0.02); // Slower approach (same as Mars)
    

    evilSatellite.position.setLength(LEO_RADIUS);


    marsEvilFollowTime += 1/60;
    if (marsEvilFollowTime > marsEvilTargetTime) {

        let newIdx;
        do {
            newIdx = Math.floor(Math.random() * marsSatellites.length);
        } while (newIdx === marsEvilTargetIdx);
        marsEvilTargetIdx = newIdx;
        marsEvilFollowTime = 0;
        marsEvilTargetTime = 7 + Math.random() * 3;
    }
    const marsTargetSat = marsSatellites[marsEvilTargetIdx];
    

    const marsTargetPos = marsTargetSat.position.clone();
    const marsEvilPos = marsEvilSatellite.position.clone();
    const directionToTarget = marsTargetPos.clone().sub(marsEvilPos).normalize();
    const desiredDistance = 0.4; // Increased distance (was 0.15 for Earth evil satellite)
    const desiredPos = marsTargetPos.clone().sub(directionToTarget.clone().multiplyScalar(desiredDistance));
    

    marsEvilSatellite.position.lerp(desiredPos, 0.02); // Slower approach (was 0.03)
    

    const marsCenter = new THREE.Vector3(MARS_DISTANCE, 0, 0);
    const marsEvilPosRelative = marsEvilSatellite.position.clone().sub(marsCenter);
    marsEvilPosRelative.setLength(MARS_LEO_RADIUS);
    marsEvilSatellite.position.copy(marsCenter.clone().add(marsEvilPosRelative));
    

    for (let i = 0; i < remoteSensingSatellites.length; i++) {
        remoteSensingTimes[i] += 1/60;
        if (!isRemoteSensing[i]) {

            if (remoteSensingTimes[i] > 15 + Math.random() * 15) {
                isRemoteSensing[i] = true;
                remoteSensingDurations[i] = (3 + Math.random() * 4) * 0.75; // 3/4th of original duration (2.25-5.25 seconds)
                remoteSensingTimes[i] = 0;
            }
        } else {

            if (remoteSensingTimes[i] > remoteSensingDurations[i]) {
                isRemoteSensing[i] = false;
                remoteSensingTimes[i] = 0;
            }
        }
    }
    

    for (let i = 0; i < marsRemoteSensingSatellites.length; i++) {
        marsRemoteSensingTimes[i] += 1/60;
        if (!marsIsRemoteSensing[i]) {

            if (marsRemoteSensingTimes[i] > 15 + Math.random() * 15) {
                marsIsRemoteSensing[i] = true;
                marsRemoteSensingDurations[i] = (3 + Math.random() * 4) * 0.75; // 3/4th of original duration (2.25-5.25 seconds)
                marsRemoteSensingTimes[i] = 0;
            }
        } else {

            if (marsRemoteSensingTimes[i] > marsRemoteSensingDurations[i]) {
                marsIsRemoteSensing[i] = false;
                marsRemoteSensingTimes[i] = 0;
            }
        }
    }


    const pulseSpeed = 0.5; // Speed of light pulse (increased)
    const pulseLength = 0.4; // Length of the pulse (as fraction of total distance)
    const retractSpeed = 1.0; // Speed of retraction (increased further)
    

    if (typeof earthToMarsSpacecraft.userData.laserSystem1 === 'undefined') {
        earthToMarsSpacecraft.userData.laserSystem1 = {
            pulseState: 'idle',
            pulseTime: 0,
            pulseProgress: 0,
            retractProgress: 0,
            tailPositionAtHit: 0,
            direction: 'earthToMars', // Dedicated to Earth to Mars only
            nextInterval: 2.0 + Math.random() * 4.0
        };
        earthToMarsSpacecraft.userData.laserSystem2 = {
            pulseState: 'idle',
            pulseTime: 0,
            pulseProgress: 0,
            retractProgress: 0,
            tailPositionAtHit: 0,
            direction: 'marsToEarth', // Dedicated to Mars to Earth only
            nextInterval: 2.0 + Math.random() * 4.0
        };
    }
    

    earthToMarsSpacecraft.userData.laserSystem1.pulseTime += 1/60;
    earthToMarsSpacecraft.userData.laserSystem2.pulseTime += 1/60;
    

    const system1 = earthToMarsSpacecraft.userData.laserSystem1;
    if (system1.pulseState === 'idle') {
        if (system1.pulseTime > system1.nextInterval) {
            system1.pulseState = 'sending';
            system1.pulseTime = 0;
            system1.pulseProgress = 0;
            system1.retractProgress = 0;
            system1.direction = 'earthToMars'; // Always Earth to Mars
            system1.nextInterval = 2.0 + Math.random() * 4.0;
        }
    } else if (system1.pulseState === 'sending') {
        system1.pulseProgress += pulseSpeed * (1/60);
        
        if (system1.pulseProgress >= 1.0) {
            system1.tailPositionAtHit = Math.max(0, system1.pulseProgress - pulseLength);
            system1.pulseState = 'retracting';
            system1.pulseTime = 0;
        }
    } else if (system1.pulseState === 'retracting') {
        system1.retractProgress += retractSpeed * (1/60);
        
        if (system1.retractProgress >= 1.0) {
            system1.pulseState = 'idle';
            system1.pulseTime = 0;
        }
    }
    

    const system2 = earthToMarsSpacecraft.userData.laserSystem2;
    if (system2.pulseState === 'idle') {
        if (system2.pulseTime > system2.nextInterval) {
            system2.pulseState = 'sending';
            system2.pulseTime = 0;
            system2.pulseProgress = 0;
            system2.retractProgress = 0;
            system2.direction = 'marsToEarth'; // Always Mars to Earth
            system2.nextInterval = 2.0 + Math.random() * 4.0;
        }
    } else if (system2.pulseState === 'sending') {
        system2.pulseProgress += pulseSpeed * (1/60);
        
        if (system2.pulseProgress >= 1.0) {
            system2.tailPositionAtHit = Math.max(0, system2.pulseProgress - pulseLength);
            system2.pulseState = 'retracting';
            system2.pulseTime = 0;
        }
    } else if (system2.pulseState === 'retracting') {
        system2.retractProgress += retractSpeed * (1/60);
        
        if (system2.retractProgress >= 1.0) {
            system2.pulseState = 'idle';
            system2.pulseTime = 0;
        }
    }
    

    const lightTime = t * 2; // Speed up light animation
    spacecraftLights.forEach((spacecraftLightSet, spacecraftIndex) => {
        spacecraftLightSet.forEach((light, lightIndex) => {
            let intensity = 0;
            
            switch (lightIndex) {
                case 0: // Red navigation light - slow blink
                    intensity = 0.5 + 0.5 * Math.sin(lightTime * 0.5);
                    break;
                case 1: // Green navigation light - slow blink (opposite phase)
                    intensity = 0.5 + 0.5 * Math.sin(lightTime * 0.5 + Math.PI);
                    break;
                case 2: // White strobe light - fast blink
                    intensity = 0.8 * Math.sin(lightTime * 3) * Math.sin(lightTime * 3);
                    break;
                case 3: // Blue status light - steady with slight pulse
                    intensity = 0.3 + 0.2 * Math.sin(lightTime * 1.5);
                    break;
            }
            
            light.intensity = intensity;
        });
    });
    

    

    const evilLightTime = t * 3; // Faster, more aggressive animation
    const animateEvilLights = (lights) => {
        lights.forEach((light, lightIndex) => {
            let intensity = 0;
            
            switch (lightIndex) {
                case 0: // Red targeting light - aggressive pulsing
                    intensity = 0.8 + 0.2 * Math.sin(evilLightTime * 4);
                    break;
                case 1: // Left warning light - warning pattern
                    intensity = 0.6 * Math.sin(evilLightTime * 2) * Math.sin(evilLightTime * 2);
                    break;
                case 2: // Right warning light - warning pattern (opposite phase)
                    intensity = 0.6 * Math.sin(evilLightTime * 2 + Math.PI) * Math.sin(evilLightTime * 2 + Math.PI);
                    break;
                case 3: // Orange jamming light - constant threat
                    intensity = 0.4 + 0.3 * Math.sin(evilLightTime * 1.5);
                    break;
            }
            
            light.intensity = intensity;
        });
    };
    
    animateEvilLights(evilSatelliteLights);
    animateEvilLights(marsEvilSatelliteLights);
    

    const spacecraftDistance = earthToMarsSpacecraft.position.distanceTo(marsToEarthSpacecraft.position);
    const commThreshold = 1.5; // Reduced threshold for closer communication
    

    

    if (spacecraftDistance < 5) { // Log when they're within 5 units

    }
    



    commLines.forEach(line => {
        scene.remove(line);
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
    });
    commLines = [];
    

    spacecraftBeams.forEach(line => {
        scene.remove(line);
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
    });
    spacecraftBeams = [];
    groundCommLines.forEach(line => {
        scene.remove(line);
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
    });
    groundCommLines = [];
    marsGroundCommLines.forEach(line => {
        scene.remove(line);
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
    });
    marsGroundCommLines = [];


    if (evilBeam) {
        scene.remove(evilBeam);
        if (evilBeam.geometry) evilBeam.geometry.dispose();
        if (evilBeam.material) evilBeam.material.dispose();
        evilBeam = null;
    }
    if (evilRadarCone) {
        scene.remove(evilRadarCone);
        if (evilRadarCone.geometry) evilRadarCone.geometry.dispose();
        if (evilRadarCone.material) evilRadarCone.material.dispose();
        evilRadarCone = null;
    }
    if (evilGroundLine) {
        scene.remove(evilGroundLine);
        if (evilGroundLine.geometry) evilGroundLine.geometry.dispose();
        if (evilGroundLine.material) evilGroundLine.material.dispose();
        evilGroundLine = null;
    }
    

    if (marsEvilBeam) {
        scene.remove(marsEvilBeam);
        if (marsEvilBeam.geometry) marsEvilBeam.geometry.dispose();
        if (marsEvilBeam.material) marsEvilBeam.material.dispose();
        marsEvilBeam = null;
    }
    if (marsEvilRadarCone) {
        scene.remove(marsEvilRadarCone);
        if (marsEvilRadarCone.geometry) marsEvilRadarCone.geometry.dispose();
        if (marsEvilRadarCone.material) marsEvilRadarCone.material.dispose();
        marsEvilRadarCone = null;
    }
    

    for (let i = 0; i < remoteSensingBeams.length; i++) {
        if (remoteSensingBeams[i]) {
            scene.remove(remoteSensingBeams[i]);
            if (remoteSensingBeams[i].geometry) remoteSensingBeams[i].geometry.dispose();
            if (remoteSensingBeams[i].material) remoteSensingBeams[i].material.dispose();
            remoteSensingBeams[i] = null;
        }
    }
    for (let i = 0; i < remoteSensingCones.length; i++) {
        if (remoteSensingCones[i]) {
            scene.remove(remoteSensingCones[i]);
            if (remoteSensingCones[i].geometry) remoteSensingCones[i].geometry.dispose();
            if (remoteSensingCones[i].material) remoteSensingCones[i].material.dispose();
            remoteSensingCones[i] = null;
        }
    }
    

    for (let i = 0; i < marsRemoteSensingBeams.length; i++) {
        if (marsRemoteSensingBeams[i]) {
            scene.remove(marsRemoteSensingBeams[i]);
            if (marsRemoteSensingBeams[i].geometry) marsRemoteSensingBeams[i].geometry.dispose();
            if (marsRemoteSensingBeams[i].material) marsRemoteSensingBeams[i].material.dispose();
            marsRemoteSensingBeams[i] = null;
        }
    }
    for (let i = 0; i < marsRemoteSensingCones.length; i++) {
        if (marsRemoteSensingCones[i]) {
            scene.remove(marsRemoteSensingCones[i]);
            if (marsRemoteSensingCones[i].geometry) marsRemoteSensingCones[i].geometry.dispose();
            if (marsRemoteSensingCones[i].material) marsRemoteSensingCones[i].material.dispose();
            marsRemoteSensingCones[i] = null;
        }
    }


    if (earthMarsLaserBeam) {
        scene.remove(earthMarsLaserBeam);
        if (earthMarsLaserBeam.geometry) earthMarsLaserBeam.geometry.dispose();
        if (earthMarsLaserBeam.material) earthMarsLaserBeam.material.dispose();
        earthMarsLaserBeam = null;
    }


    

    if (earthToMarsSpacecraft.userData.laserSystem1.pulseState === 'sending') {
        const progress = earthToMarsSpacecraft.userData.laserSystem1.pulseProgress;
        const direction = earthToMarsSpacecraft.userData.laserSystem1.direction;
        

        const earthPos1 = new THREE.Vector3(0, EARTH_RADIUS + 0.02, 0.1); // Earth laser station 1
        const marsPos1 = new THREE.Vector3(MARS_DISTANCE, MARS_RADIUS + 0.02, 0.1); // Mars laser station 1
        
        let startPos, endPos;
        if (direction === 'earthToMars') {
            startPos = earthPos1;
            endPos = marsPos1;
        } else {
            startPos = marsPos1;
            endPos = earthPos1;
        }
        

        const pulseFrontPos = startPos.clone().lerp(endPos, progress);
        

        const tailProgress = Math.max(0, progress - pulseLength);
        const pulseTailPos = startPos.clone().lerp(endPos, tailProgress);
        

        const pulseDirection = pulseFrontPos.clone().sub(pulseTailPos);
        const pulseLength3D = pulseDirection.length();
        
        if (pulseLength3D > 0.1) { // Only create beam if it has meaningful length

            const coreGeom = new THREE.CylinderGeometry(0.015, 0.015, pulseLength3D, 16);
            const coreMat = new THREE.MeshBasicMaterial({
                color: 0xffffff, // Bright white core
                transparent: true,
                opacity: 0.9
            });
            const corePulse = new THREE.Mesh(coreGeom, coreMat);
            corePulse.position.copy(pulseTailPos.clone().add(pulseDirection.clone().multiplyScalar(0.5)));
            corePulse.lookAt(pulseFrontPos);
            corePulse.rotateX(Math.PI / 2);
            scene.add(corePulse);
            spacecraftBeams.push(corePulse);
            

            const glowGeom = new THREE.CylinderGeometry(0.025, 0.025, pulseLength3D, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: direction === 'earthToMars' ? 0x00ffff : 0xff8800, // Cyan for Earth, Orange for Mars
                transparent: true,
                opacity: 0.6
            });
            const glowPulse = new THREE.Mesh(glowGeom, glowMat);
            glowPulse.position.copy(pulseTailPos.clone().add(pulseDirection.clone().multiplyScalar(0.5)));
            glowPulse.lookAt(pulseFrontPos);
            glowPulse.rotateX(Math.PI / 2);
            scene.add(glowPulse);
            spacecraftBeams.push(glowPulse);
        }
    } else if (earthToMarsSpacecraft.userData.laserSystem1.pulseState === 'retracting') {
        const retractProgress = earthToMarsSpacecraft.userData.laserSystem1.retractProgress;
        const direction = earthToMarsSpacecraft.userData.laserSystem1.direction;
        

        const earthPos1 = new THREE.Vector3(0, EARTH_RADIUS + 0.02, 0.1); // Earth laser station 1
        const marsPos1 = new THREE.Vector3(MARS_DISTANCE, MARS_RADIUS + 0.02, 0.1); // Mars laser station 1
        
        let startPos, endPos;
        if (direction === 'earthToMars') {
            startPos = earthPos1;
            endPos = marsPos1;
        } else {
            startPos = marsPos1;
            endPos = earthPos1;
        }
        

        const beamFrontPos = endPos.clone();
        

        const tailPositionAtHit = earthToMarsSpacecraft.userData.laserSystem1.tailPositionAtHit;
        const currentTailProgress = tailPositionAtHit + (retractProgress * (1.0 - tailPositionAtHit));
        const beamTailPos = startPos.clone().lerp(endPos, currentTailProgress);
        

        const beamDirection = beamFrontPos.clone().sub(beamTailPos);
        const beamLength3D = beamDirection.length();
        
        if (beamLength3D > 0.1) { // Only create beam if it has meaningful length

            const coreGeom = new THREE.CylinderGeometry(0.02, 0.02, beamLength3D, 16);
            const coreMat = new THREE.MeshBasicMaterial({
                color: 0xffffff, // Bright white core
                transparent: true,
                opacity: 0.9
            });
            const coreBeam = new THREE.Mesh(coreGeom, coreMat);
            coreBeam.position.copy(beamTailPos.clone().add(beamDirection.clone().multiplyScalar(0.5)));
            coreBeam.lookAt(beamFrontPos);
            coreBeam.rotateX(Math.PI / 2);
            scene.add(coreBeam);
            spacecraftBeams.push(coreBeam);
            

            const glowGeom = new THREE.CylinderGeometry(0.03, 0.03, beamLength3D, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: direction === 'earthToMars' ? 0x00ffff : 0xff8800, // Cyan for Earth, Orange for Mars
                transparent: true,
                opacity: 0.6
            });
            const glowBeam = new THREE.Mesh(glowGeom, glowMat);
            glowBeam.position.copy(beamTailPos.clone().add(beamDirection.clone().multiplyScalar(0.5)));
            glowBeam.lookAt(beamFrontPos);
            glowBeam.rotateX(Math.PI / 2);
            scene.add(glowBeam);
            spacecraftBeams.push(glowBeam);
        }
    }
    

    if (earthToMarsSpacecraft.userData.laserSystem2.pulseState === 'sending') {
        const progress = earthToMarsSpacecraft.userData.laserSystem2.pulseProgress;
        const direction = earthToMarsSpacecraft.userData.laserSystem2.direction;
        

        const earthPos2 = new THREE.Vector3(0, EARTH_RADIUS + 0.02, -0.1); // Earth laser station 2
        const marsPos2 = new THREE.Vector3(MARS_DISTANCE, MARS_RADIUS + 0.02, -0.1); // Mars laser station 2
        
        let startPos, endPos;
        if (direction === 'earthToMars') {
            startPos = earthPos2;
            endPos = marsPos2;
        } else {
            startPos = marsPos2;
            endPos = earthPos2;
        }
        

        const pulseFrontPos = startPos.clone().lerp(endPos, progress);
        

        const tailProgress = Math.max(0, progress - pulseLength);
        const pulseTailPos = startPos.clone().lerp(endPos, tailProgress);
        

        const pulseDirection = pulseFrontPos.clone().sub(pulseTailPos);
        const pulseLength3D = pulseDirection.length();
        
        if (pulseLength3D > 0.1) { // Only create beam if it has meaningful length

            const coreGeom = new THREE.CylinderGeometry(0.015, 0.015, pulseLength3D, 16);
            const coreMat = new THREE.MeshBasicMaterial({
                color: 0xffffff, // Bright white core
                transparent: true,
                opacity: 0.9
            });
            const corePulse = new THREE.Mesh(coreGeom, coreMat);
            corePulse.position.copy(pulseTailPos.clone().add(pulseDirection.clone().multiplyScalar(0.5)));
            corePulse.lookAt(pulseFrontPos);
            corePulse.rotateX(Math.PI / 2);
            scene.add(corePulse);
            spacecraftBeams.push(corePulse);
            

            const glowGeom = new THREE.CylinderGeometry(0.025, 0.025, pulseLength3D, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: direction === 'earthToMars' ? 0x00ffff : 0xff8800, // Cyan for Earth, Orange for Mars
                transparent: true,
                opacity: 0.6
            });
            const glowPulse = new THREE.Mesh(glowGeom, glowMat);
            glowPulse.position.copy(pulseTailPos.clone().add(pulseDirection.clone().multiplyScalar(0.5)));
            glowPulse.lookAt(pulseFrontPos);
            glowPulse.rotateX(Math.PI / 2);
            scene.add(glowPulse);
            spacecraftBeams.push(glowPulse);
        }
    } else if (earthToMarsSpacecraft.userData.laserSystem2.pulseState === 'retracting') {
        const retractProgress = earthToMarsSpacecraft.userData.laserSystem2.retractProgress;
        const direction = earthToMarsSpacecraft.userData.laserSystem2.direction;
        

        const earthPos2 = new THREE.Vector3(0, EARTH_RADIUS + 0.02, -0.1); // Earth laser station 2
        const marsPos2 = new THREE.Vector3(MARS_DISTANCE, MARS_RADIUS + 0.02, -0.1); // Mars laser station 2
        
        let startPos, endPos;
        if (direction === 'earthToMars') {
            startPos = earthPos2;
            endPos = marsPos2;
        } else {
            startPos = marsPos2;
            endPos = earthPos2;
        }
        

        const beamFrontPos = endPos.clone();
        

        const tailPositionAtHit = earthToMarsSpacecraft.userData.laserSystem2.tailPositionAtHit;
        const currentTailProgress = tailPositionAtHit + (retractProgress * (1.0 - tailPositionAtHit));
        const beamTailPos = startPos.clone().lerp(endPos, currentTailProgress);
        

        const beamDirection = beamFrontPos.clone().sub(beamTailPos);
        const beamLength3D = beamDirection.length();
        
        if (beamLength3D > 0.1) { // Only create beam if it has meaningful length

            const coreGeom = new THREE.CylinderGeometry(0.02, 0.02, beamLength3D, 16);
            const coreMat = new THREE.MeshBasicMaterial({
                color: 0xffffff, // Bright white core
                transparent: true,
                opacity: 0.9
            });
            const coreBeam = new THREE.Mesh(coreGeom, coreMat);
            coreBeam.position.copy(beamTailPos.clone().add(beamDirection.clone().multiplyScalar(0.5)));
            coreBeam.lookAt(beamFrontPos);
            coreBeam.rotateX(Math.PI / 2);
            scene.add(coreBeam);
            spacecraftBeams.push(coreBeam);
            

            const glowGeom = new THREE.CylinderGeometry(0.03, 0.03, beamLength3D, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: direction === 'earthToMars' ? 0x00ffff : 0xff8800, // Cyan for Earth, Orange for Mars
                transparent: true,
                opacity: 0.6
            });
            const glowBeam = new THREE.Mesh(glowGeom, glowMat);
            glowBeam.position.copy(beamTailPos.clone().add(beamDirection.clone().multiplyScalar(0.5)));
            glowBeam.lookAt(beamFrontPos);
            glowBeam.rotateX(Math.PI / 2);
            scene.add(glowBeam);
            spacecraftBeams.push(glowBeam);
        }
    }


    const maxSatCommDistance = EARTH_RADIUS * 4;
    for (let i = 0; i < satellites.length; i++) {
        for (let j = i + 1; j < satellites.length; j++) {
            const satA = satellites[i];
            const satB = satellites[j];
            const dist = satA.position.distanceTo(satB.position);



            const p1 = satA.position;
            const p2 = satB.position;
            const v = p2.clone().sub(p1);
            const t = -p1.clone().dot(v) / v.lengthSq();
            let closest;
            if (t < 0) closest = p1;
            else if (t > 1) closest = p2;
            else closest = p1.clone().add(v.clone().multiplyScalar(t));
            const minDistToCenter = closest.length();

            if (dist < maxSatCommDistance && minDistToCenter > EARTH_RADIUS) {

                const pairKey = `${i}-${j}`;
                

                const closeDistance = EARTH_RADIUS * 1.5; // Close satellites threshold
                const isClose = dist < closeDistance;
                

                if (!satelliteCommStates[pairKey]) {
                    satelliteCommStates[pairKey] = {
                        isCommunicating: false,
                        startTime: 0,
                        duration: 0,
                        nextStartTime: Math.random() * 4,
                        isClose: isClose
                    };
                }
                
                const commState = satelliteCommStates[pairKey];
                
                if (isClose) {

                    commState.isCommunicating = true;
                } else {

                    if (!commState.isCommunicating) {

                        if (t > commState.nextStartTime) {
                            commState.isCommunicating = true;
                            commState.startTime = t;
                            commState.duration = 2 + Math.random() * 4; // 2-6 seconds of communication
                        }
                    } else {

                        if (t - commState.startTime > commState.duration) {
                            commState.isCommunicating = false;
                            commState.nextStartTime = t + 1 + Math.random() * 3; // 1-4 seconds until next communication
                        }
                    }
                }
                

                if (commState.isCommunicating) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        satA.position.clone(),
                        satB.position.clone()
                    ]);
                    const material = new THREE.LineBasicMaterial({
                        color: isClose ? 0x00ff00 : 0x00ff00, // Same color for now
                        linewidth: 2,
                        transparent: true,
                        opacity: 0.8
                    });
                    const line = new THREE.Line(geometry, material);
                    scene.add(line);
                    commLines.push(line);
                }
            }
        }
    }


    const maxMarsSatCommDistance = MARS_RADIUS * 3;
    for (let i = 0; i < marsSatellites.length; i++) {
        for (let j = i + 1; j < marsSatellites.length; j++) {
            const satA = marsSatellites[i];
            const satB = marsSatellites[j];
            const dist = satA.position.distanceTo(satB.position);



            const marsCenter = new THREE.Vector3(MARS_DISTANCE, 0, 0);
            const p1 = satA.position.clone().sub(marsCenter);
            const p2 = satB.position.clone().sub(marsCenter);
            const v = p2.clone().sub(p1);
            const t = -p1.clone().dot(v) / v.lengthSq();
            let closest;
            if (t < 0) closest = p1;
            else if (t > 1) closest = p2;
            else closest = p1.clone().add(v.clone().multiplyScalar(t));
            const minDistToMarsCenter = closest.length();

                        if (dist < maxMarsSatCommDistance && minDistToMarsCenter > MARS_RADIUS) {

                const marsPairKey = `mars-${i}-${j}`;
                

                const marsCloseDistance = MARS_RADIUS * 1.5; // Close satellites threshold
                const marsIsClose = dist < marsCloseDistance;
                

                if (!marsSatelliteCommStates[marsPairKey]) {
                    marsSatelliteCommStates[marsPairKey] = {
                        isCommunicating: false,
                        startTime: 0,
                        duration: 0,
                        nextStartTime: Math.random() * 4,
                        isClose: marsIsClose
                    };
                }
                
                const marsCommState = marsSatelliteCommStates[marsPairKey];
                
                if (marsIsClose) {

                    marsCommState.isCommunicating = true;
                } else {

                    if (!marsCommState.isCommunicating) {

                        if (t > marsCommState.nextStartTime) {
                            marsCommState.isCommunicating = true;
                            marsCommState.startTime = t;
                            marsCommState.duration = 2 + Math.random() * 4; // 2-6 seconds of communication
                        }
                    } else {

                        if (t - marsCommState.startTime > marsCommState.duration) {
                            marsCommState.isCommunicating = false;
                            marsCommState.nextStartTime = t + 1 + Math.random() * 3; // 1-4 seconds until next communication
                        }
                    }
                }
                

                if (marsCommState.isCommunicating) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        satA.position.clone(),
                        satB.position.clone()
                    ]);
                    const material = new THREE.LineBasicMaterial({
                        color: 0x00ffff, // Cyan for Mars satellite communications
                        linewidth: 2,
                        transparent: true,
                        opacity: 0.8
                    });
                    const line = new THREE.Line(geometry, material);
                    scene.add(line);
                    commLines.push(line);
                }
            }
        }
    }


    const groundCommAngleThreshold = THREE.MathUtils.degToRad(20); // 20 degrees
    groundStations.forEach((gs, gsIndex) => {
        const isEvil = gs === evilGroundStation;
        const gsPosNorm = gs.position.clone().normalize();
        satellites.forEach((sat, satIndex) => {
            const satPosNorm = sat.position.clone().normalize();
            const angle = gsPosNorm.angleTo(satPosNorm);
            if (angle < groundCommAngleThreshold) {

                const groundPairKey = `ground-${gsIndex}-${satIndex}`;
                

                if (!groundCommStates[groundPairKey]) {
                    groundCommStates[groundPairKey] = {
                        isCommunicating: false,
                        startTime: 0,
                        duration: 0,
                        nextStartTime: Math.random() * 15 // Random start within 15 seconds (less frequent)
                    };
                }
                
                const groundCommState = groundCommStates[groundPairKey];
                

                if (!groundCommState.isCommunicating) {

                    if (t > groundCommState.nextStartTime) {
                        groundCommState.isCommunicating = true;
                        groundCommState.startTime = t;
                        groundCommState.duration = 1.5 + Math.random() * 3; // 1.5-4.5 seconds of communication
                    }
                } else {

                    if (t - groundCommState.startTime > groundCommState.duration) {
                        groundCommState.isCommunicating = false;
                        groundCommState.nextStartTime = t + 8 + Math.random() * 12; // 8-20 seconds until next communication (less frequent)
                    }
                }
                

                if (groundCommState.isCommunicating) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        gs.position.clone(),
                        sat.position.clone()
                    ]);
                    const material = new THREE.LineBasicMaterial({
                        color: isEvil ? 0xaa00ff : 0xff9900, // purple for evil, orange for normal
                        linewidth: 2,
                        transparent: true,
                        opacity: 0.9
                    });
                    const line = new THREE.Line(geometry, material);
                    scene.add(line);
                    groundCommLines.push(line);
                }
            }
        });
    });


    marsGroundStations.forEach((gs, gsIndex) => {

        const gsPosRelativeToMars = gs.position.clone().sub(new THREE.Vector3(MARS_DISTANCE, 0, 0));
        const gsPosNorm = gsPosRelativeToMars.normalize();
        
        marsSatellites.forEach((sat, satIndex) => {

            const satPosRelativeToMars = sat.position.clone().sub(new THREE.Vector3(MARS_DISTANCE, 0, 0));
            const satPosNorm = satPosRelativeToMars.normalize();
            
            const angle = gsPosNorm.angleTo(satPosNorm);
            if (angle < groundCommAngleThreshold) {

                const marsGroundPairKey = `mars-ground-${gsIndex}-${satIndex}`;
                

                if (!marsGroundCommStates[marsGroundPairKey]) {
                    marsGroundCommStates[marsGroundPairKey] = {
                        isCommunicating: false,
                        startTime: 0,
                        duration: 0,
                        nextStartTime: Math.random() * 12 // Random start within 12 seconds (less frequent than satellites)
                    };
                }
                
                const marsGroundCommState = marsGroundCommStates[marsGroundPairKey];
                

                if (!marsGroundCommState.isCommunicating) {

                    if (t > marsGroundCommState.nextStartTime) {
                        marsGroundCommState.isCommunicating = true;
                        marsGroundCommState.startTime = t;
                        marsGroundCommState.duration = 1.5 + Math.random() * 3; // 1.5-4.5 seconds of communication
                    }
                } else {

                    if (t - marsGroundCommState.startTime > marsGroundCommState.duration) {
                        marsGroundCommState.isCommunicating = false;
                        marsGroundCommState.nextStartTime = t + 6 + Math.random() * 10; // 6-16 seconds until next communication (less frequent)
                    }
                }
                

                if (marsGroundCommState.isCommunicating) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        gs.position.clone(),
                        sat.position.clone()
                    ]);
                    const material = new THREE.LineBasicMaterial({
                        color: 0xff00ff, // Magenta for Mars ground communications
                        linewidth: 2,
                        transparent: true,
                        opacity: 0.9
                    });
                    const line = new THREE.Line(geometry, material);
                    scene.add(line);
                    marsGroundCommLines.push(line);
                }
            }
        });
    });


    if (evilSatellite && targetSat) {

        const evilDirection = targetSat.position.clone().sub(evilSatellite.position).normalize();
        const beamStart = evilSatellite.position.clone().add(evilDirection.clone().multiplyScalar(0.15)); // Start 0.15 units from center
        

        const coneLength = beamStart.distanceTo(targetSat.position);
        const coneGeom = new THREE.ConeGeometry(0.02, coneLength, 32, 1, true); // Start narrow (0.02 radius)
        const coneMat = new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
        evilRadarCone = new THREE.Mesh(coneGeom, coneMat);
        


        const earthConeCenterOffset = evilDirection.clone().multiplyScalar(coneLength / 2);
        const earthConeCenterPos = beamStart.clone().add(earthConeCenterOffset);
        
        evilRadarCone.position.copy(earthConeCenterPos);
        evilRadarCone.lookAt(targetSat.position);
        evilRadarCone.rotateX(Math.PI/2);
        evilRadarCone.rotateZ(Math.PI); // Flip the cone so wide end is at target
        scene.add(evilRadarCone);
        

        const beamGeom = new THREE.BufferGeometry().setFromPoints([
            beamStart,
            targetSat.position.clone()
        ]);
        const beamMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2, transparent: true, opacity: 0.8 });
        evilBeam = new THREE.Line(beamGeom, beamMat);
        scene.add(evilBeam);
    }


    if (evilSatellite && evilGroundStation) {

        const gsPosNorm = evilGroundStation.position.clone().normalize();
        const satPosNorm = evilSatellite.position.clone().normalize();
        const angle = gsPosNorm.angleTo(satPosNorm);
        if (angle < THREE.MathUtils.degToRad(20)) {
            const geom = new THREE.BufferGeometry().setFromPoints([
                evilGroundStation.position.clone(),
                evilSatellite.position.clone()
            ]);
            const mat = new THREE.LineBasicMaterial({ color: 0xff2222, linewidth: 2, transparent: true, opacity: 0.9 });
            evilGroundLine = new THREE.Line(geom, mat);
            scene.add(evilGroundLine);
        }
    }


    if (marsEvilSatellite && marsTargetSat) {

        const marsEvilDirection = marsTargetSat.position.clone().sub(marsEvilSatellite.position).normalize();
        const marsBeamStart = marsEvilSatellite.position.clone().add(marsEvilDirection.clone().multiplyScalar(0.15)); // Start 0.15 units from center
        

        const coneLength = marsBeamStart.distanceTo(marsTargetSat.position);
        const coneGeom = new THREE.ConeGeometry(0.02, coneLength, 32, 1, true); // Start narrow (0.02 radius)
        const coneMat = new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
        marsEvilRadarCone = new THREE.Mesh(coneGeom, coneMat);
        


        const marsConeCenterOffset = marsEvilDirection.clone().multiplyScalar(coneLength / 2);
        const marsConeCenterPos = marsBeamStart.clone().add(marsConeCenterOffset);
        
        marsEvilRadarCone.position.copy(marsConeCenterPos);
        marsEvilRadarCone.lookAt(marsTargetSat.position);
        marsEvilRadarCone.rotateX(Math.PI/2);
        marsEvilRadarCone.rotateZ(Math.PI); // Flip the cone so wide end is at target
        scene.add(marsEvilRadarCone);
        

        const beamGeom = new THREE.BufferGeometry().setFromPoints([
            marsBeamStart,
            marsTargetSat.position.clone()
        ]);
        const beamMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2, transparent: true, opacity: 0.8 });
        marsEvilBeam = new THREE.Line(beamGeom, beamMat);
        scene.add(marsEvilBeam);
    }
















    

    for (let i = 0; i < remoteSensingSatellites.length; i++) {
        if (isRemoteSensing[i] && remoteSensingSatellites[i]) {
            const satellite = remoteSensingSatellites[i];
            

            const satPos = satellite.position.clone();
            const earthCenter = new THREE.Vector3(0, 0, 0);
            const directionToEarth = earthCenter.clone().sub(satPos).normalize();
            const earthSurfacePoint = directionToEarth.clone().multiplyScalar(EARTH_RADIUS);
            

            const beamStartOffset = 0.15; // Distance to move beam start toward Earth
            const beamStartPos = satPos.clone().add(directionToEarth.clone().multiplyScalar(beamStartOffset));
            

            const coneLength = beamStartPos.distanceTo(earthSurfacePoint) * 0.5; // Half the length
            const coneGeom = new THREE.ConeGeometry(0.6, coneLength, 32, 1, true); // Wider cone (0.6 radius)
            const coneMat = new THREE.MeshBasicMaterial({ 
                color: 0x00ff88, // Green for remote sensing
                transparent: true, 
                opacity: 0.3, 
                side: THREE.DoubleSide 
            });
            remoteSensingCones[i] = new THREE.Mesh(coneGeom, coneMat);
            


            const coneCenterOffset = directionToEarth.clone().multiplyScalar(coneLength / 2);
            const coneCenterPos = beamStartPos.clone().add(coneCenterOffset);
            
            remoteSensingCones[i].position.copy(coneCenterPos);
            remoteSensingCones[i].lookAt(earthSurfacePoint);
            remoteSensingCones[i].rotateX(Math.PI/2);
            remoteSensingCones[i].rotateZ(Math.PI); // Flip so wide end is at Earth
            scene.add(remoteSensingCones[i]);
        }
    }
    

    for (let i = 0; i < marsRemoteSensingSatellites.length; i++) {
        if (marsIsRemoteSensing[i] && marsRemoteSensingSatellites[i]) {
            const satellite = marsRemoteSensingSatellites[i];
            

            const satPos = satellite.position.clone();
            const marsCenter = new THREE.Vector3(MARS_DISTANCE, 0, 0);
            const directionToMars = marsCenter.clone().sub(satPos).normalize();
            const marsSurfacePoint = directionToMars.clone().multiplyScalar(MARS_RADIUS).add(marsCenter);
            

            const beamStartOffset = 0.15; // Distance to move beam start toward Mars
            const beamStartPos = satPos.clone().add(directionToMars.clone().multiplyScalar(beamStartOffset));
            

            const coneLength = beamStartPos.distanceTo(marsSurfacePoint) * 0.5; // Half the length
            const coneGeom = new THREE.ConeGeometry(0.6, coneLength, 32, 1, true); // Wider cone (0.6 radius)
            const coneMat = new THREE.MeshBasicMaterial({ 
                color: 0xff8800, // Orange for Mars remote sensing
                transparent: true, 
                opacity: 0.3, 
                side: THREE.DoubleSide 
            });
            marsRemoteSensingCones[i] = new THREE.Mesh(coneGeom, coneMat);
            


            const coneCenterOffset = directionToMars.clone().multiplyScalar(coneLength / 2);
            const coneCenterPos = beamStartPos.clone().add(coneCenterOffset);
            
            marsRemoteSensingCones[i].position.copy(coneCenterPos);
            marsRemoteSensingCones[i].lookAt(marsSurfacePoint);
            marsRemoteSensingCones[i].rotateX(Math.PI/2);
            marsRemoteSensingCones[i].rotateZ(Math.PI); // Flip so wide end is at Mars
            scene.add(marsRemoteSensingCones[i]);
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function createGroundStation(lat, lon, evil = false, mars = false) {

    const latRad = THREE.MathUtils.degToRad(lat);
    const lonRad = THREE.MathUtils.degToRad(lon);

    const r = (mars ? MARS_RADIUS : EARTH_RADIUS) + 0.01; // Slightly above surface
    const x = r * Math.cos(latRad) * Math.cos(lonRad);
    const y = r * Math.sin(latRad);
    const z = r * Math.cos(latRad) * Math.sin(lonRad);


    const dishGeom = new THREE.SphereGeometry(0.08, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2);
    const dishMat = evil
        ? new THREE.MeshPhongMaterial({ color: 0xff2222, shininess: 100, specular: 0x880000 })
        : new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100, specular: 0x888888 });
    const dish = new THREE.Mesh(dishGeom, dishMat);
    dish.rotation.x = Math.PI; // Point up


    const hornGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.06, 12);
    const hornMat = evil
        ? new THREE.MeshPhongMaterial({ color: 0x880000 })
        : new THREE.MeshPhongMaterial({ color: 0x888888 });
    const horn = new THREE.Mesh(hornGeom, hornMat);
    horn.position.y = 0.06;
    dish.add(horn);


    const baseGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.06, 12);
    const baseMat = evil
        ? new THREE.MeshPhongMaterial({ color: 0x330000 })
        : new THREE.MeshPhongMaterial({ color: 0x444444 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = -0.07;
    dish.add(base);


    const station = new THREE.Group();
    station.add(dish);
    station.position.set(x, y, z);

    station.lookAt(0, 0, 0);
    station.rotateX(Math.PI / 2);
    

    station.scale.set(0.7, 0.7, 0.7);
    

    if (mars) {
        station.position.x += MARS_DISTANCE;
    }
    
    return station;
}

function createEvilSatellite() {
    const group = new THREE.Group();
    

    const bodyGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.18, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x111111,
        shininess: 20,
        specular: 0x000000
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    group.add(body);
    

    const stealthGeom = new THREE.BoxGeometry(0.16, 0.01, 0.04);
    const stealthMat = new THREE.MeshPhongMaterial({ 
        color: 0x000000,
        shininess: 10,
        specular: 0x000000
    });
    
    const topStealth = new THREE.Mesh(stealthGeom, stealthMat);
    topStealth.position.z = 0.05;
    group.add(topStealth);
    
    const bottomStealth = new THREE.Mesh(stealthGeom, stealthMat);
    bottomStealth.position.z = -0.05;
    group.add(bottomStealth);
    

    const createEvilSolarPanel = (position) => {
        const panelGroup = new THREE.Group();
        

        const frameGeom = new THREE.BoxGeometry(0.18, 0.02, 0.06);
        const frameMat = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            shininess: 20,
            specular: 0x000000
        });
        const frame = new THREE.Mesh(frameGeom, frameMat);
        panelGroup.add(frame);
        

        const cellSize = 0.025;
        const cellSpacing = 0.002;
        const startX = -0.075;
        const startZ = -0.025;
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 6; col++) {
                const cellGeom = new THREE.BoxGeometry(cellSize, 0.001, cellSize);
                const cellMat = new THREE.MeshPhongMaterial({ 
                    color: 0x330000,
                    emissive: 0x110000,
                    shininess: 30,
                    specular: 0x000000
                });
                const cell = new THREE.Mesh(cellGeom, cellMat);
                cell.position.x = startX + col * (cellSize + cellSpacing);
                cell.position.y = 0.011;
                cell.position.z = startZ + row * (cellSize + cellSpacing);
                panelGroup.add(cell);
                

                if (col < 5) {
                    const interconnectGeom = new THREE.BoxGeometry(cellSpacing, 0.0005, cellSize * 0.8);
                    const interconnectMat = new THREE.MeshPhongMaterial({ 
                        color: 0x222222,
                        shininess: 20,
                        specular: 0x000000
                    });
                    const interconnect = new THREE.Mesh(interconnectGeom, interconnectMat);
                    interconnect.position.x = startX + col * (cellSize + cellSpacing) + cellSize + cellSpacing/2;
                    interconnect.position.y = 0.0115;
                    interconnect.position.z = startZ + row * (cellSize + cellSpacing);
                    panelGroup.add(interconnect);
                }
            }
        }
        

        const bracketGeom = new THREE.BoxGeometry(0.02, 0.01, 0.06);
        const bracketMat = new THREE.MeshPhongMaterial({ 
            color: 0x222222,
            shininess: 30
        });
        
        const leftBracket = new THREE.Mesh(bracketGeom, bracketMat);
        leftBracket.position.x = -0.1;
        leftBracket.position.y = -0.005;
        panelGroup.add(leftBracket);
        
        const rightBracket = new THREE.Mesh(bracketGeom, bracketMat);
        rightBracket.position.x = 0.1;
        rightBracket.position.y = -0.005;
        panelGroup.add(rightBracket);
        

        const edgeGeom = new THREE.BoxGeometry(0.18, 0.005, 0.005);
        const edgeMat = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            shininess: 20
        });
        
        const topEdge = new THREE.Mesh(edgeGeom, edgeMat);
        topEdge.position.z = 0.0325;
        panelGroup.add(topEdge);
        
        const bottomEdge = new THREE.Mesh(edgeGeom, edgeMat);
        bottomEdge.position.z = -0.0325;
        panelGroup.add(bottomEdge);
        
        panelGroup.position.copy(position);
        return panelGroup;
    };
    
    const leftPanel = createEvilSolarPanel(new THREE.Vector3(-0.13, 0, 0));
    group.add(leftPanel);
    
    const rightPanel = createEvilSolarPanel(new THREE.Vector3(0.13, 0, 0));
    group.add(rightPanel);
    

    const boomGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.12, 8);
    const boomMat = new THREE.MeshPhongMaterial({ 
        color: 0x222222,
        shininess: 40
    });
    
    const leftBoom = new THREE.Mesh(boomGeom, boomMat);
    leftBoom.position.x = -0.19;
    leftBoom.rotation.z = Math.PI / 2;
    group.add(leftBoom);
    
    const rightBoom = new THREE.Mesh(boomGeom, boomMat);
    rightBoom.position.x = 0.19;
    rightBoom.rotation.z = Math.PI / 2;
    group.add(rightBoom);
    

    const antennaGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.08, 8);
    const antennaMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff2222,
        emissive: 0x440000,
        shininess: 100
    });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.z = 0.09;
    antenna.rotation.x = Math.PI / 2;
    group.add(antenna);
    

    const jammingDishGeom = new THREE.SphereGeometry(0.03, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.5);
    const jammingDishMat = new THREE.MeshPhongMaterial({ 
        color: 0x880000,
        shininess: 120,
        specular: 0x440000
    });
    const jammingDish = new THREE.Mesh(jammingDishGeom, jammingDishMat);
    jammingDish.position.z = 0.09;
    jammingDish.rotation.x = Math.PI;
    group.add(jammingDish);
    

    const ewarGeom = new THREE.BoxGeometry(0.02, 0.01, 0.02);
    const ewarMat = new THREE.MeshPhongMaterial({ 
        color: 0x330000,
        shininess: 60
    });
    
    const leftEwar = new THREE.Mesh(ewarGeom, ewarMat);
    leftEwar.position.x = -0.08;
    leftEwar.position.z = 0.06;
    group.add(leftEwar);
    
    const rightEwar = new THREE.Mesh(ewarGeom, ewarMat);
    rightEwar.position.x = 0.08;
    rightEwar.position.z = 0.06;
    group.add(rightEwar);
    

    const sensorGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8);
    const sensorMat = new THREE.MeshPhongMaterial({ 
        color: 0x000000,
        shininess: 100,
        specular: 0x000000
    });
    const sensor = new THREE.Mesh(sensorGeom, sensorMat);
    sensor.position.z = -0.08;
    sensor.rotation.x = Math.PI / 2;
    group.add(sensor);
    

    const thrusterGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8);
    const thrusterMat = new THREE.MeshPhongMaterial({ 
        color: 0x111111,
        shininess: 30
    });
    
    const thruster1 = new THREE.Mesh(thrusterGeom, thrusterMat);
    thruster1.position.x = -0.08;
    thruster1.position.z = -0.06;
    thruster1.rotation.z = Math.PI / 2;
    group.add(thruster1);
    
    const thruster2 = new THREE.Mesh(thrusterGeom, thrusterMat);
    thruster2.position.x = 0.08;
    thruster2.position.z = -0.06;
    thruster2.rotation.z = Math.PI / 2;
    group.add(thruster2);
    

    group.rotation.y = Math.PI / 6; // 30 degrees rotation
    group.rotation.z = Math.PI / 12; // 15 degrees tilt
    

    group.position.set(LEO_RADIUS, 0, 0);
    return group;
}

function createLaserStation(mars = false) {
    const group = new THREE.Group();
    

    const dishGeom = new THREE.SphereGeometry(0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.5);
    const dishMat = new THREE.MeshPhongMaterial({ 
        color: mars ? 0x444444 : 0x666666, // Darker for Mars
        shininess: 100, 
        specular: 0x222222 
    });
    const dish = new THREE.Mesh(dishGeom, dishMat);
    dish.rotation.x = Math.PI; // Point up
    group.add(dish);
    

    const laserGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.08, 16);
    const laserMat = new THREE.MeshPhongMaterial({ 
        color: 0x00ffff, // Cyan for laser
        emissive: 0x004444,
        shininess: 200
    });
    const laser = new THREE.Mesh(laserGeom, laserMat);
    laser.position.y = 0.08;
    group.add(laser);
    

    const lensRingGeom = new THREE.RingGeometry(0.03, 0.06, 16);
    const lensMat = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.7,
        side: THREE.DoubleSide 
    });
    const lensRing = new THREE.Mesh(lensRingGeom, lensMat);
    lensRing.position.y = 0.12;
    lensRing.rotation.x = Math.PI / 2;
    group.add(lensRing);
    

    const supportGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 12);
    const supportMat = new THREE.MeshPhongMaterial({ 
        color: mars ? 0x222222 : 0x333333 
    });
    const support = new THREE.Mesh(supportGeom, supportMat);
    support.position.y = -0.06;
    group.add(support);
    

    const baseGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
    const baseMat = new THREE.MeshPhongMaterial({ 
        color: mars ? 0x111111 : 0x222222 
    });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = -0.12;
    group.add(base);
    

    if (mars) {

        group.rotation.y = Math.PI + Math.PI / 2; // Rotate 180 + 90 degrees to face left and then 90 more to the left
        group.rotateX(Math.PI / 2); // Tilt up
    } else {

        group.lookAt(MARS_DISTANCE, 0, 0);
        group.rotateX(Math.PI / 2);
    }
    
    return group;
}

function createSpacecraft(marsToEarth = false) {
    const group = new THREE.Group();
    

    const bodyGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 16);
    const bodyMat = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, // White like SpaceX Starship
        shininess: 120,
        specular: 0x666666
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.z = Math.PI / 2; // Orient horizontally
    group.add(body);
    

    const tileGeom = new THREE.BoxGeometry(0.22, 0.005, 0.04);
    const tileMat = new THREE.MeshPhongMaterial({ 
        color: 0xeeeeee,
        shininess: 80,
        specular: 0x444444
    });
    

    const topTiles = new THREE.Mesh(tileGeom, tileMat);
    topTiles.position.z = 0.08;
    group.add(topTiles);
    

    const bottomTiles = new THREE.Mesh(tileGeom, tileMat);
    bottomTiles.position.z = -0.08;
    group.add(bottomTiles);
    

    const noseGeom = new THREE.ConeGeometry(0.12, 0.18, 16);
    const noseMat = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        shininess: 100,
        specular: 0x555555
    });
    const nose = new THREE.Mesh(noseGeom, noseMat);
    nose.position.x = 0.39; // Always on the right side
    group.add(nose);
    

    const heatShieldGeom = new THREE.RingGeometry(0.08, 0.12, 16);
    const heatShieldMat = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 60
    });
    const heatShield = new THREE.Mesh(heatShieldGeom, heatShieldMat);
    heatShield.position.x = 0.3;
    heatShield.rotation.z = Math.PI / 2;
    group.add(heatShield);
    

    const windowGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8);
    const windowMat = new THREE.MeshPhongMaterial({ 
        color: 0x88ccff,
        transparent: true,
        opacity: 0.8,
        shininess: 200,
        specular: 0xffffff
    });
    
    const leftWindow = new THREE.Mesh(windowGeom, windowMat);
    leftWindow.position.x = 0.1;
    leftWindow.position.z = 0.08;
    leftWindow.rotation.z = Math.PI / 2;
    group.add(leftWindow);
    
    const rightWindow = new THREE.Mesh(windowGeom, windowMat);
    rightWindow.position.x = 0.1;
    rightWindow.position.z = -0.08;
    rightWindow.rotation.z = Math.PI / 2;
    group.add(rightWindow);
    

    const createSpacecraftSolarPanel = (position) => {
        const panelGroup = new THREE.Group();
        

        const frameGeom = new THREE.BoxGeometry(0.7, 0.015, 0.25);
        const frameMat = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            shininess: 60,
            specular: 0x222222
        });
        const frame = new THREE.Mesh(frameGeom, frameMat);
        panelGroup.add(frame);
        

        const cellSize = 0.04;
        const cellSpacing = 0.003;
        const startX = -0.3;
        const startZ = -0.1;
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 14; col++) {
                const cellGeom = new THREE.BoxGeometry(cellSize, 0.001, cellSize);
                const cellMat = new THREE.MeshPhongMaterial({ 
                    color: 0x2244aa,
                    emissive: 0x112244,
                    shininess: 120,
                    specular: 0x666666
                });
                const cell = new THREE.Mesh(cellGeom, cellMat);
                cell.position.x = startX + col * (cellSize + cellSpacing);
                cell.position.y = 0.008;
                cell.position.z = startZ + row * (cellSize + cellSpacing);
                panelGroup.add(cell);
                

                if (col < 13) {
                    const interconnectGeom = new THREE.BoxGeometry(cellSpacing, 0.0005, cellSize * 0.8);
                    const interconnectMat = new THREE.MeshPhongMaterial({ 
                        color: 0xcccccc,
                        shininess: 100,
                        specular: 0x888888
                    });
                    const interconnect = new THREE.Mesh(interconnectGeom, interconnectMat);
                    interconnect.position.x = startX + col * (cellSize + cellSpacing) + cellSize + cellSpacing/2;
                    interconnect.position.y = 0.0085;
                    interconnect.position.z = startZ + row * (cellSize + cellSpacing);
                    panelGroup.add(interconnect);
                }
            }
        }
        

        const bracketGeom = new THREE.BoxGeometry(0.03, 0.02, 0.25);
        const bracketMat = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            shininess: 70
        });
        
        const leftBracket = new THREE.Mesh(bracketGeom, bracketMat);
        leftBracket.position.x = -0.35;
        leftBracket.position.y = -0.005;
        panelGroup.add(leftBracket);
        
        const rightBracket = new THREE.Mesh(bracketGeom, bracketMat);
        rightBracket.position.x = 0.35;
        rightBracket.position.y = -0.005;
        panelGroup.add(rightBracket);
        

        const edgeGeom = new THREE.BoxGeometry(0.7, 0.005, 0.005);
        const edgeMat = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            shininess: 50
        });
        
        const topEdge = new THREE.Mesh(edgeGeom, edgeMat);
        topEdge.position.z = 0.1325;
        panelGroup.add(topEdge);
        
        const bottomEdge = new THREE.Mesh(edgeGeom, edgeMat);
        bottomEdge.position.z = -0.1325;
        panelGroup.add(bottomEdge);
        

        const sideEdgeGeom = new THREE.BoxGeometry(0.005, 0.005, 0.25);
        const sideEdgeMat = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            shininess: 50
        });
        
        const leftSideEdge = new THREE.Mesh(sideEdgeGeom, sideEdgeMat);
        leftSideEdge.position.x = -0.3575;
        panelGroup.add(leftSideEdge);
        
        const rightSideEdge = new THREE.Mesh(sideEdgeGeom, sideEdgeMat);
        rightSideEdge.position.x = 0.3575;
        panelGroup.add(rightSideEdge);
        
        panelGroup.position.copy(position);
        return panelGroup;
    };
    
    const leftWing = createSpacecraftSolarPanel(new THREE.Vector3(-0.15, 0, 0.14));
    group.add(leftWing);
    
    const rightWing = createSpacecraftSolarPanel(new THREE.Vector3(-0.15, 0, -0.14));
    group.add(rightWing);
    

    const deployGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8);
    const deployMat = new THREE.MeshPhongMaterial({ 
        color: 0x666666,
        shininess: 70
    });
    
    const leftDeploy = new THREE.Mesh(deployGeom, deployMat);
    leftDeploy.position.x = -0.2;
    leftDeploy.position.z = 0.14;
    leftDeploy.rotation.z = Math.PI / 2;
    group.add(leftDeploy);
    
    const rightDeploy = new THREE.Mesh(deployGeom, deployMat);
    rightDeploy.position.x = -0.2;
    rightDeploy.position.z = -0.14;
    rightDeploy.rotation.z = Math.PI / 2;
    group.add(rightDeploy);
    

    const rcsGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8);
    const rcsMat = new THREE.MeshPhongMaterial({ 
        color: 0x555555,
        shininess: 60
    });
    

    const topRCS = new THREE.Mesh(rcsGeom, rcsMat);
    topRCS.position.z = 0.15;
    topRCS.rotation.x = Math.PI / 2;
    group.add(topRCS);
    

    const bottomRCS = new THREE.Mesh(rcsGeom, rcsMat);
    bottomRCS.position.z = -0.15;
    bottomRCS.rotation.x = Math.PI / 2;
    group.add(bottomRCS);
    

    const sideRCS1 = new THREE.Mesh(rcsGeom, rcsMat);
    sideRCS1.position.x = 0.05;
    sideRCS1.position.z = 0.12;
    sideRCS1.rotation.z = Math.PI / 2;
    group.add(sideRCS1);
    
    const sideRCS2 = new THREE.Mesh(rcsGeom, rcsMat);
    sideRCS2.position.x = 0.05;
    sideRCS2.position.z = -0.12;
    sideRCS2.rotation.z = Math.PI / 2;
    group.add(sideRCS2);
    

    const engineGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.1, 8);
    const engineMat = new THREE.MeshPhongMaterial({ 
        color: 0x222222,
        shininess: 40
    });
    

    const centerEngine = new THREE.Mesh(engineGeom, engineMat);
    centerEngine.position.x = -0.35; // Always on the left side
    group.add(centerEngine);
    

    const nozzleGeom = new THREE.CylinderGeometry(0.03, 0.025, 0.02, 8);
    const nozzleMat = new THREE.MeshPhongMaterial({ 
        color: 0x111111,
        shininess: 30
    });
    
    const centerNozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
    centerNozzle.position.x = -0.41;
    group.add(centerNozzle);
    

    const leftEngine = new THREE.Mesh(engineGeom, engineMat);
    leftEngine.position.x = -0.35; // Always on the left side
    leftEngine.position.z = 0.08;
    group.add(leftEngine);
    
    const rightEngine = new THREE.Mesh(engineGeom, engineMat);
    rightEngine.position.x = -0.35; // Always on the left side
    rightEngine.position.z = -0.08;
    group.add(rightEngine);
    
    const leftNozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
    leftNozzle.position.x = -0.41;
    leftNozzle.position.z = 0.08;
    group.add(leftNozzle);
    
    const rightNozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
    rightNozzle.position.x = -0.41;
    rightNozzle.position.z = -0.08;
    group.add(rightNozzle);
    

    const dishGeom = new THREE.SphereGeometry(0.05, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dishMat = new THREE.MeshPhongMaterial({ 
        color: 0x444444,
        shininess: 120,
        specular: 0x222222
    });
    const dish = new THREE.Mesh(dishGeom, dishMat);
    dish.position.z = 0.18;
    dish.rotation.x = Math.PI;
    group.add(dish);
    

    const gimbalGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.03, 8);
    const gimbalMat = new THREE.MeshPhongMaterial({ 
        color: 0x666666,
        shininess: 80
    });
    const gimbal = new THREE.Mesh(gimbalGeom, gimbalMat);
    gimbal.position.z = 0.195;
    gimbal.rotation.x = Math.PI / 2;
    group.add(gimbal);
    

    const dockGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
    const dockMat = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        shininess: 90
    });
    const dock = new THREE.Mesh(dockGeom, dockMat);
    dock.position.x = 0.25;
    dock.rotation.z = Math.PI / 2;
    group.add(dock);
    

    const dockRingGeom = new THREE.RingGeometry(0.04, 0.05, 16);
    const dockRingMat = new THREE.MeshPhongMaterial({ 
        color: 0x666666,
        shininess: 70
    });
    const dockRing = new THREE.Mesh(dockRingGeom, dockRingMat);
    dockRing.position.x = 0.26;
    dockRing.rotation.z = Math.PI / 2;
    group.add(dockRing);
    

    

    const radiatorGeom = new THREE.BoxGeometry(0.3, 0.01, 0.15);
    const radiatorMat = new THREE.MeshPhongMaterial({ 
        color: 0x444444,
        shininess: 50
    });
    
    const leftRadiator = new THREE.Mesh(radiatorGeom, radiatorMat);
    leftRadiator.position.x = -0.1;
    leftRadiator.position.z = 0.2;
    group.add(leftRadiator);
    
    const rightRadiator = new THREE.Mesh(radiatorGeom, radiatorMat);
    rightRadiator.position.x = -0.1;
    rightRadiator.position.z = -0.2;
    group.add(rightRadiator);
    
    return group;
}