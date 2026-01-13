import { Buffer } from 'node:buffer';
import { EventEmitter } from 'node:events';

// Buffer'ı global yap
globalThis.Buffer = Buffer;

// Process nesnesini mockla (nextTick hatası almamak için)
if (typeof globalThis.process === 'undefined') {
    globalThis.process = {
        env: {},
        version: 'v18.0.0',
        nextTick: (cb: Function) => setTimeout(cb, 0),
        browser: false, // Browser olmadığını açıkça belirtiyoruz
    } as any;
}

// EventEmitter'ı global yap
if (typeof globalThis.EventEmitter === 'undefined') {
    (globalThis as any).EventEmitter = EventEmitter;
}