import { describe, expect, it } from 'vitest';
import { classifyCrisis, normalizeForCrisis } from '@/lib/ask-earth/system-prompt';

describe('classifyCrisis — imminent (Tier 3)', () => {
  it.each([
    'i want to kill myself',
    'killing myself tonight',
    'killed myself laughing', // idiom — false positive acceptable per foundation doc
    'killmyself',              // no-space obfuscation
    'kill my self',            // split-word obfuscation
    'kms',
    'k m s',                   // space-separated letters
    'k.m.s',                   // dot-separated
    'k-m-s',                   // dash-separated
    'i want to unalive myself',
    'unalive',
    'end my life',
    'ending my life',
    'end my story',
    'end my journey',
    'end my chapter',
    'end my time',
    'taking my own life',
    'take my life',
    'suicide',
    'suicidal',
    'suicîde',                 // diacritic
    'su1c1de',                 // leetspeak
    's u i c i d e',           // space-separated letters
    's.u.i.c.i.d.e',
    'suicidio',                // Spanish/Portuguese/Italian
    'suicidarme',              // Spanish reflexive
    'me quiero matar',         // Spanish: "I want to kill myself"
    '自杀',                     // Chinese simplified
    '自殺',                     // Chinese traditional
    'κill myself',             // Greek kappa homoglyph
    'i have the pills',
    'i got the rope',
    "i'm standing on the bridge",
    'easiest way to die',
    'how do i die',
    'how do i kill',
    'self-harm',
    'selfharm',
    'hurting myself',
    'hurt myself',
    'hurtmyself',
  ])('flags imminent: %s', (input) => {
    expect(classifyCrisis(input)).toBe('imminent');
  });
});

describe('classifyCrisis — possible (Tier 2)', () => {
  it.each([
    "i don't want to be here",
    'i dont want to live',
    'want it all to stop',
    "i can't do this anymore",
    "i'm done",
    "what's the point of living",
    'give me one reason not to check out',
    'checking out',
    'return to the earth',
    'tired of being here',
    'tired of it all',
    'time to disappear',
    'would it matter if i disappeared',
    'ready to rest forever',
    "everyone would be better off without me",
    'no one would miss me if i',
    'done being here',
    'want to fade',
    'want to vanish',
    'just want to sleep forever',
    'nothing left to live for',
  ])('flags possible: %s', (input) => {
    expect(classifyCrisis(input)).toBe('possible');
  });
});

describe('classifyCrisis — non-crisis', () => {
  it.each([
    'what is your surface made of',
    'how many people are there',
    'i am tired',                        // short, not in possible bank
    'i love the earth',
    'can you tell me about oceans',
    'how old are you',
    'tell me a story',
    'kill time',                         // idiom, no "my"
    'kill the lights',
    'end of the day',
    'my life is busy',                   // no "end"
    '',
    '   ',
  ])('does not flag: %s', (input) => {
    expect(classifyCrisis(input)).toBeNull();
  });
});

describe('normalizeForCrisis', () => {
  it('strips accents', () => {
    expect(normalizeForCrisis('suicîde')).toBe('suicide');
  });
  it('folds homoglyphs', () => {
    expect(normalizeForCrisis('κill')).toBe('kill');
  });
  it('folds leetspeak digits', () => {
    expect(normalizeForCrisis('su1c1de')).toBe('suicide');
    expect(normalizeForCrisis('5u1c1d3')).toBe('suicide');
  });
  it('collapses letter-separator runs', () => {
    expect(normalizeForCrisis('s u i c i d e')).toBe('suicide');
    expect(normalizeForCrisis('k.m.s')).toBe('kms');
    expect(normalizeForCrisis('k-m-s')).toBe('kms');
  });
  it('leaves normal prose untouched', () => {
    expect(normalizeForCrisis('i am tired')).toBe('i am tired');
    expect(normalizeForCrisis('a lone wolf')).toBe('a lone wolf');
  });
  it('folds digits even in unambiguous numerics (acceptable side-effect)', () => {
    // Digit folding is deliberately aggressive. No false negatives result;
    // only false positives on numeric-heavy inputs, which the foundation
    // doc tolerates (safety > precision).
    expect(normalizeForCrisis('the year is 2024')).toBe('the year is 2o2a');
  });
  it('lowercases', () => {
    expect(normalizeForCrisis('SUICIDE')).toBe('suicide');
  });
});
