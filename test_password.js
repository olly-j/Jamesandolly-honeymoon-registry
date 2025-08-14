console.log('Testing password system...');
console.log('Password: jamesandolly');
console.log('Expected: grantAccess() called');

// Test if the gate overlay exists
const gateOverlay = document.getElementById('gate-overlay');
console.log('Gate overlay found:', !!gateOverlay);

// Test if the code input exists
const codeInput = document.getElementById('code-input');
console.log('Code input found:', !!codeInput);

// Test if the submit button exists
const codeSubmit = document.getElementById('code-submit');
console.log('Submit button found:', !!codeSubmit);

// Test if main content exists
const mainContent = document.getElementById('main-content');
console.log('Main content found:', !!mainContent);

// Test if envelope animation exists
const envelopeAnimation = document.getElementById('envelope-animation-overlay');
console.log('Envelope animation found:', !!envelopeAnimation);

// Test localStorage
console.log('Current access granted:', localStorage.getItem('accessGranted'));

// Test if elements object is defined
if (typeof elements !== 'undefined') {
    console.log('Elements object found:', !!elements);
    console.log('Elements properties:', Object.keys(elements));
} else {
    console.log('Elements object not found - this might be the issue');
}
