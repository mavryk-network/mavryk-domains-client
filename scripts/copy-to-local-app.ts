import * as fs from 'fs-extra';

async function run() {
    const from = ['conseil-client/dist', 'core/dist', 'manager/dist', 'resolver/dist', 'taquito/dist', 'taquito-client/dist'];
    const files = from.map(f => ({ from: `./packages/${f}`, to: `E:/work/xtz-domains/app/node_modules/@tezos-domains/${f}` }));

    console.log('-- copying files');
    files.forEach(f => {
        fs.emptyDirSync(f.to);
        console.log(`-- emptied: '${f.to}'`);

        fs.copySync(f.from, f.to, { overwrite: true, recursive: true });
        console.log(`-- copied '${f.from}' to '${f.to}'`);
    });

    console.log('-- DONE');
}

void run();
