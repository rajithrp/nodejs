// eslint-disable-next-line import/no-extraneous-dependencies
import { oneLineTrim } from 'common-tags'
import {
  buildRequestForClientCredentialsFlow,
  buildRequestForPasswordFlow,
  buildRequestForRefreshTokenFlow,
  buildRequestForAnonymousSessionFlow,
} from '../src/build-requests'
import { scopes } from '../src'

const allScopes = Object.keys(scopes).map(key => scopes[key])

function createTestOptions (options) {
  return {
    host: 'http://localhost:8080',
    projectKey: 'test',
    credentials: {
      clientId: '123',
      clientSecret: 'secret',
      user: {
        username: 'foobar',
        password: 'verysecurepassword',
      },
    },
    scopes: allScopes,
    ...options,
  }
}

describe('buildRequestForPasswordFlow', () => {
  const body = oneLineTrim`
    grant_type=password&
    username=foobar&
    password=verysecurepassword&
    scope=${allScopes.join(' ')}
  `
  it('build request values with all the given options', () => {
    const options = createTestOptions()
    expect(buildRequestForPasswordFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/oauth/test/customers/token',
      body,
    })
  })

  it('uses custom oauth uri, if given', () => {
    const options = createTestOptions({ oauthUri: '/foo/bar' })
    expect(buildRequestForPasswordFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/foo/bar',
      body,
    })
  })

  it('parses a host that ends with slash', () => {
    const options = createTestOptions({
      host: 'http://localhost:8080/',
    })
    expect(buildRequestForPasswordFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/oauth/test/customers/token',
      body,
    })
  })

  it('parses a host that ends without slash', () => {
    const options = createTestOptions({
      host: 'http://localhost:8080',
    })
    expect(buildRequestForPasswordFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/oauth/test/customers/token',
      body,
    })
  })

  it('validate required options', () => {
    expect(
      () => buildRequestForPasswordFlow(),
    ).toThrowError('Missing required options')
  })

  it('validate required option (host)', () => {
    expect(
      () => buildRequestForPasswordFlow({}),
    ).toThrowError('Missing required option (host)')
  })

  it('validate required option (projectKey)', () => {
    const options = createTestOptions({
      projectKey: undefined,
    })
    expect(
      () => buildRequestForPasswordFlow(options),
    ).toThrowError('Missing required option (projectKey)')
  })

  it('validate required option (credentials)', () => {
    const options = createTestOptions({
      credentials: undefined,
    })
    expect(
      () => buildRequestForPasswordFlow(options),
    ).toThrowError('Missing required option (credentials)')
  })

  it('validate required option (clientId, clientSecret)', () => {
    const options = createTestOptions({
      credentials: {},
    })
    expect(
      () => buildRequestForPasswordFlow(options),
    ).toThrowError(
      'Missing required credentials (clientId, clientSecret, user)',
    )
  })

  it('validate required option (username, password)', () => {
    const options = createTestOptions({
      credentials: {
        clientId: 'foo',
        clientSecret: 'baz',
        user: {
          username: 'bar',
        },
      },
    })
    expect(
      () => buildRequestForPasswordFlow(options),
    ).toThrowError(
      'Missing required user credentials (username, password)',
    )
  })

  it('validate both credentials are required', () => {
    const options = createTestOptions({
      credentials: { clientId: '123' },
    })
    expect(
      () => buildRequestForPasswordFlow(options),
    ).toThrowError(
      'Missing required credentials (clientId, clientSecret, user)',
    )
  })
})

describe('buildRequestForClientCredentialsFlow', () => {
  it('build request values with all the given options', () => {
    const options = createTestOptions()
    expect(buildRequestForClientCredentialsFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/oauth/token',
      body: `grant_type=client_credentials&scope=${allScopes.join(' ')}`,
    })
  })

  it('uses custom oauth uri, if given', () => {
    const options = createTestOptions({ oauthUri: '/foo/bar' })
    expect(buildRequestForClientCredentialsFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/foo/bar',
      body: `grant_type=client_credentials&scope=${allScopes.join(' ')}`,
    })
  })

  it('parses a host that ends with slash', () => {
    const options = createTestOptions({
      host: 'http://localhost:8080/',
    })
    expect(buildRequestForClientCredentialsFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/oauth/token',
      body: `grant_type=client_credentials&scope=${allScopes.join(' ')}`,
    })
  })

  it('parses a host that ends without slash', () => {
    const options = createTestOptions({
      host: 'http://localhost:8080',
    })
    expect(buildRequestForClientCredentialsFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/oauth/token',
      body: `grant_type=client_credentials&scope=${allScopes.join(' ')}`,
    })
  })

  it('validate required options', () => {
    expect(
      () => buildRequestForClientCredentialsFlow(),
    ).toThrowError('Missing required options')
  })

  it('validate required option (host)', () => {
    expect(
      () => buildRequestForClientCredentialsFlow({}),
    ).toThrowError('Missing required option (host)')
  })

  it('validate required option (projectKey)', () => {
    const options = createTestOptions({
      projectKey: undefined,
    })
    expect(
      () => buildRequestForClientCredentialsFlow(options),
    ).toThrowError('Missing required option (projectKey)')
  })

  it('validate required option (credentials)', () => {
    const options = createTestOptions({
      credentials: undefined,
    })
    expect(
      () => buildRequestForClientCredentialsFlow(options),
    ).toThrowError('Missing required option (credentials)')
  })

  it('validate required option (clientId, clientSecret)', () => {
    const options = createTestOptions({
      credentials: {},
    })
    expect(
      () => buildRequestForClientCredentialsFlow(options),
    ).toThrowError('Missing required credentials (clientId, clientSecret)')
  })

  it('validate both credentials are required', () => {
    const options = createTestOptions({
      credentials: { clientId: '123' },
    })
    expect(
      () => buildRequestForClientCredentialsFlow(options),
    ).toThrowError('Missing required credentials (clientId, clientSecret)')
  })
})

describe('buildRequestForRefreshTokenFlow', () => {
  const mockCred = {
    credentials: {
      clientId: '123',
      clientSecret: 'secret',
    },
    refreshToken: 'foobar123',
    scopes: undefined,
  }
  it('build request values with all the given options', () => {
    const options = createTestOptions(mockCred)
    expect(buildRequestForRefreshTokenFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/oauth/token',
      body: 'grant_type=refresh_token&refresh_token=foobar123',
    })
  })

  it('uses custom oauth uri, if given', () => {
    const options = createTestOptions({ oauthUri: '/foo/bar', ...mockCred })
    expect(buildRequestForRefreshTokenFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/foo/bar',
      body: 'grant_type=refresh_token&refresh_token=foobar123',
    })
  })

  it('parses a host that ends with slash', () => {
    const options = createTestOptions({
      host: 'http://localhost:8080/',
      ...mockCred,
    })
    expect(buildRequestForRefreshTokenFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/oauth/token',
      body: 'grant_type=refresh_token&refresh_token=foobar123',
    })
  })

  it('parses a host that ends without slash', () => {
    const options = createTestOptions({
      host: 'http://localhost:8080',
      ...mockCred,
    })
    expect(buildRequestForRefreshTokenFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/oauth/token',
      body: 'grant_type=refresh_token&refresh_token=foobar123',
    })
  })

  it('validate required options', () => {
    expect(
      () => buildRequestForRefreshTokenFlow(),
    ).toThrowError('Missing required options')
  })

  it('validate required option (host)', () => {
    expect(
      () => buildRequestForRefreshTokenFlow({}),
    ).toThrowError('Missing required option (host)')
  })

  it('validate required option (projectKey)', () => {
    const options = createTestOptions({
      projectKey: undefined,
    })
    expect(
      () => buildRequestForRefreshTokenFlow(options),
    ).toThrowError('Missing required option (projectKey)')
  })

  it('validate required option (credentials)', () => {
    const options = createTestOptions({
      credentials: undefined,
    })
    expect(
      () => buildRequestForRefreshTokenFlow(options),
    ).toThrowError('Missing required option (credentials)')
  })

  it('validate required option (refreshToken)', () => {
    const options = createTestOptions({
      ...mockCred,
      refreshToken: undefined,
    })
    expect(
      () => buildRequestForRefreshTokenFlow(options),
    ).toThrowError('Missing required option (refreshToken)')
  })

  it('validate required option (clientId, clientSecret)', () => {
    const options = createTestOptions({
      ...mockCred,
      credentials: {},
    })
    expect(
      () => buildRequestForRefreshTokenFlow(options),
    ).toThrowError(
      'Missing required credentials (clientId, clientSecret)',
    )
  })

  it('validate both credentials are required', () => {
    const options = createTestOptions({
      ...mockCred,
      credentials: { clientId: '123' },
    })
    expect(
      () => buildRequestForRefreshTokenFlow(options),
    ).toThrowError(
      'Missing required credentials (clientId, clientSecret)',
    )
  })
})

describe('buildRequestForAnonymousSessionFlow', () => {
  it('build request values with all the given options', () => {
    const options = createTestOptions()
    expect(buildRequestForAnonymousSessionFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/oauth/test/anonymous/token',
      body: `grant_type=client_credentials&scope=${allScopes.join(' ')}`,
    })
  })

  it('validate required options', () => {
    expect(
      () => buildRequestForAnonymousSessionFlow(),
    ).toThrowError('Missing required options')
  })

  it('validate required option (projectKey)', () => {
    const options = createTestOptions({
      projectKey: undefined,
    })
    expect(
      () => buildRequestForAnonymousSessionFlow(options),
    ).toThrowError('Missing required option (projectKey)')
  })

  it('should add anonymousId if passed in', () => {
    const mockCred = {
      clientId: '123',
      clientSecret: 'secret',
      anonymousId: 'youdontknowme',
    }
    const options = createTestOptions({ credentials: mockCred })
    expect(buildRequestForAnonymousSessionFlow(options)).toEqual({
      basicAuth: 'MTIzOnNlY3JldA==',
      url: 'http://localhost:8080/oauth/test/anonymous/token',
      body: oneLineTrim`
        grant_type=client_credentials&
        scope=${allScopes.join(' ')}&
        anonymous_id=youdontknowme
      `,
    })
  })
})
