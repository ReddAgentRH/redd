import { Command } from "commander";
import { JsonRpcProvider } from "ethers";
import { loadConfig } from "./config.js";
import { ReddChain } from "./chain.js";
import { RuleIntentParser } from "./intent.js";
import { dispatch } from "./dispatch.js";

export function buildProgram(): Command {
  const program = new Command();
  program.name("redd").description("REDD - the DeFi agent that remembers").version("0.1.0");

  program
    .command("do")
    .argument("<goal...>", "what you want REDD to do, in plain language")
    .option("--owner <address>", "your wallet address for read actions", "")
    .action(async (goalParts: string[], opts: { owner: string }) => {
      const config = loadConfig();
      const provider = new JsonRpcProvider(config.rpcUrl, config.chainId);
      const chain = new ReddChain({
        send: (m, p) => provider.send(m, p ?? []),
        call: (tx) => provider.call(tx)
      });
      const intent = new RuleIntentParser().parse(goalParts.join(" "));
      const out = await dispatch(intent, { chain, config, ownerAddress: opts.owner });
      process.stdout.write(out + "\n");
    });

  return program;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildProgram().parse(process.argv);
}
