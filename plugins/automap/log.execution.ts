import c from "ansi-colors";
import { unknown } from "@flatfile/api/core/schemas";

/**
 * A method decorator that logs the method name, execution duration, and whether the execution was successful.
 * If the 'VERBOSE' environment variable is set, it also logs the input and output of the method.
 *
 * @param target The prototype of the class (since this is a static method)
 * @param propertyKey The name of the method
 * @param descriptor The property descriptor of the method
 * @returns The modified property descriptor
 */
export function LogExecution() {
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;

    function logResult(args: any[], startTime: number, result: any, success: boolean, error?: any) {
      const endTime = performance.now();
      const status = success ? c.green("✓") : c.red("✗");
      console.log(
        `  ${status} ${c.gray(((endTime - startTime).toFixed(2) + "ms").padEnd(10))} ${c.magentaBright(
          `${propertyKey}(`
        )}${prettyLog(args)}${c.magentaBright(")")} => ${prettyLog(result)}`
      );

      if (process.env.DEBUG_LEVEL === "verbose") {
        console.log(`Input to ${propertyKey}:`);
        console.dir(arguments);
        console.log(`Output of ${propertyKey}:`);
        console.dir(result);
        if (error) {
          console.log(`Error in ${propertyKey}:`);
          console.dir(error);
        }
      }
    }

    descriptor.value = function (...args: any[]) {
      const startTime = performance.now();
      try {
        const result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result
            .then((res) => {
              logResult(args, startTime, res, true);
              return res;
            })
            .catch((err) => {
              logResult(args, startTime, null, false, err);
              throw err;
            });
        } else {
          logResult(args, startTime, result, true);
          return result;
        }
      } catch (err) {
        logResult(args, startTime, null, false, err);
        throw err;
      }
    };

    return descriptor;
  };
}

type SimplifiedArgs = (string | number | boolean)[];

function simplifyArgs(args: any): SimplifiedArgs {
  if (!args) {
    return []
  }
  if (!Array.isArray(args)) {
    args = [args];
  }
  return args.map((arg) => {
    if (typeof arg === "string") {
      return arg.length > 15 ? arg.substring(0, 12) + "..." : arg;
    }

    if (typeof arg === "number" || typeof arg === "boolean") {
      return arg;
    }

    if (typeof arg === "object") {
      return `Object<${Object.keys(arg as object).length} keys>`;
    }

    return String(arg);
  });
}

function prettyLog(src: any): string {
  if (src === undefined) {
    return c.white.bold('void');
  }
  const args = simplifyArgs(src);
  return args
    .map((arg) => {
      if (typeof arg === "string") {
        return c.cyan(arg);
      }

      if (typeof arg === "number") {
        return c.yellow(arg.toString());
      }

      if (typeof arg === "boolean") {
        return c.magenta(arg.toString());
      }

      return c.white(arg);
    })
    .join(", ");
}
