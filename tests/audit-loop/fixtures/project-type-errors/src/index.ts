function getAge(): string {
  return 25; // type error: returns number instead of string
}

const greeting: number = "hello"; // type error: string assigned to number

function double(n: number): string {
  return n * 2; // type error: returns number but expects string
}
