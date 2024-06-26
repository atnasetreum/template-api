import { Injectable } from '@nestjs/common';

const cluster = require('cluster');
import * as process from 'node:process';
import * as os from 'node:os';

@Injectable()
export class ClusterService {
  static clusterize(callback: Function): void {
    if (cluster.isMaster) {
      console.log(`MASTER SERVER (${process.pid}) IS RUNNING `);
      const numCPUs = os.cpus().length;
      console.log('NUM OF CPUS TO FORK: ', numCPUs);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker) => {
        console.log(`worker ${worker.process.pid} died`);
      });
    } else {
      callback().then(() => {
        console.log(`Procces runing in: ${process.pid}`);
      });
    }
  }
}
