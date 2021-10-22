import fs from 'fs';
import {BitStream, BitView} from "bit-buffer";

const adjectives = JSON.parse(fs.readFileSync('corpora/adjs.json').toString()).adjs;
console.log('adjectives', adjectives.length);

const verbs = JSON.parse(fs.readFileSync('corpora/verbs.json').toString()).verbs;
console.log('verbs', verbs.length);

const animals = JSON.parse(fs.readFileSync('corpora/animals.json').toString()).animals;
console.log('animals', animals.length);

const input = {
	name: 'Slawa',
	surname: 'Doe',
	dob: new Date('2000-01-01'),
};

// https://stegriff.co.uk/upblog/bit-packing-binary-in-javascript-and-json/
function pack(bytes) {
	var chars = [];
	for(var i = 0, n = bytes.length; i < n;) {
		chars.push(((bytes[i++] & 0xff) << 8) | (bytes[i++] & 0xff));
	}
	return String.fromCharCode.apply(null, chars);
}

function unpack(str) {
	var bytes = [];
	for(var i = 0, n = str.length; i < n; i++) {
		var char = str.charCodeAt(i);
		bytes.push(char >>> 8, char & 0xFF);
	}
	return bytes;
}

/** @deprecated */
function manualBase64(merge) {
	const symbols = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	console.log('symbols', symbols.length);

	const charPos = [];
	for (let chr of merge) {
		const pos = symbols.indexOf(chr);
		charPos.push(pos);
	}
	console.log(charPos, charPos.length);
}

function encode(input) {
	let sDob = input.dob.toISOString().substr(0, 10).replaceAll('-', '');
	sDob = Math.floor(input.dob.getTime()/86400_000).toString(16);
	let merge = input.name + '/' + sDob + '/' + input.surname;
	merge = merge.replaceAll(" ", '+');
	merge = merge.replaceAll("'", '/');
	console.log(merge, merge.length);
	const baseDecode = Buffer.from(merge, 'base64');
	console.log(baseDecode, baseDecode.length);

	const uniPack = pack([...baseDecode]);
	console.log(uniPack, uniPack.length);

	//manualBase64(merge);
	baseDecode[0] = 0xFF;
	baseDecode[1] = 0xFF;
	console.log(Array.from(baseDecode).map(x => x.toString(16)));

	const bv = new BitStream(baseDecode);
	const i1 = bv.readBits(8, false);
	const i2 = bv.readBits(9, false);
	const mnemonic = adjectives[i1] + ' ' + animals[i2];
	console.log(i1.toString(16), i2.toString(16), mnemonic);
}

encode(input);
