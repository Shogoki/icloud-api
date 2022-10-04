start: 
	deno --unstable run --allow-env --allow-read --allow-net index.ts
dev: 
	deno --unstable run --allow-env --allow-read --allow-net --watch index.ts