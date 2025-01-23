declare module '@vimeo/vimeo' {
  export class Vimeo {
    constructor(clientId: string, clientSecret: string, accessToken: string)
    request: (
      options: {
        method: string
        path: string
        query?: Record<string, any>
        headers?: Record<string, string>
      },
      callback?: (error: any, body: any) => void
    ) => Promise<any>
  }
}
