/**
 * `--name=value` と `--name value` の両方から CLI オプションを読み取る。
 *
 * Makefile と npm scripts で書き方が揃わないため、どちらの形でも受け取れるようにしている。
 */
export function getCliOption(name: string): string | undefined {
  const equalsPrefix = `--${name}=`
  const equalsOption = process.argv.find((argument) => argument.startsWith(equalsPrefix))
  if (equalsOption) return equalsOption.slice(equalsPrefix.length)

  const optionIndex = process.argv.indexOf(`--${name}`)
  if (optionIndex < 0) return undefined

  return process.argv[optionIndex + 1]
}
