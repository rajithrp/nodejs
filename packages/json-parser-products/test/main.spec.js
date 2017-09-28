import StreamTest from 'streamtest'
import JSONParserProduct from '../src/main'

const streamTest = StreamTest['v2']

describe('JSONParserProduct', () => {
  let jsonParserProduct
  beforeEach(() => {
    const logger = {
      error: () => {},
      warn: () => {},
      info: () => {},
      verbose: () => {},
    }
    const parserConfig = {
      staged: true,
      batch: 5,
      predicate: 'foo=bar',
      expand: 'something',
      total: 20,
    }
    jsonParserProduct = new JSONParserProduct(
      { projectKey: 'project-key' },
      parserConfig,
      logger,
      'myAccessToken',
      )
  })

  describe('::constructor', () => {
    it('should initialize with defaults', () => {
      const apiConfig = {
        projectKey: 'foo',
      }
      const defaultConfig = {
        delimiter: ',',
        multiValueDelimiter: ';',
        continueOnProblems: false,
        categoryOrderHintBy: 'id',
      }

      jsonParserProduct = new JSONParserProduct(apiConfig)
      expect(jsonParserProduct.logger).toBeDefined()
      expect(jsonParserProduct.client).toBeDefined()
      expect(jsonParserProduct.parserConfig).toEqual(defaultConfig)
    })
  })

  describe('::parse', () => {
    beforeEach(() => {
      jsonParserProduct._resolveReferences = jest.fn(() => {})
    })

    afterEach(() => {
      jsonParserProduct._resolveReferences.mockRestore()
    })

    describe('::onReadable', () => {
      const midMarker = '\n\n\n'
      const endMarker = '\n\n'

      it('do nothing if an empty chunk is passed as product', (done) => {
        const inputStream = streamTest.fromChunks([])
        inputStream.on('end', () => {
          expect(jsonParserProduct._resolveReferences).not.toBeCalled()
          done()
        })
        jsonParserProduct.parse(inputStream)
      })

      it('process chunk that end with product delimiters', (done) => {
        const product1 = '{"product": "my-great-hoodie"}'
        const product2 = '{"anotherProduct": "comfortable-shoes"}'
        const myChunk = `${product1}${midMarker}${product2}${endMarker}`
        const expected = [JSON.parse(product1), JSON.parse(product2)]
        const inputStream = streamTest.fromChunks([myChunk])

        inputStream.on('end', () => {
          expect(jsonParserProduct._resolveReferences).toHaveBeenCalledTimes(1)
          expect(jsonParserProduct._resolveReferences).toBeCalledWith(expected)
          done()
        })
        jsonParserProduct.parse(inputStream)
      })

      it('process only products followed by end or middle marker', (done) => {
        const product1 = '{"product": "my-great-hoodie"}'
        const product2 = '{"anotherProduct": "comfortable-shoes"}'
        const myChunk = `${product1}${midMarker}${product2}`
        const expected = [JSON.parse(product1)]
        const inputStream = streamTest.fromChunks([myChunk])

        inputStream.on('end', () => {
          expect(jsonParserProduct._resolveReferences).toHaveBeenCalledTimes(1)
          expect(jsonParserProduct._resolveReferences).toBeCalledWith(expected)
          done()
        })
        jsonParserProduct.parse(inputStream)
      })

      it('do not process if chunk only contains incomplete product', (done) => {
        const incompleteProduct = '{"product": "my-gre'
        const inputStream = streamTest.fromChunks([incompleteProduct])

        inputStream.on('end', () => {
          expect(jsonParserProduct._resolveReferences).not.toBeCalled()
          done()
        })
        jsonParserProduct.parse(inputStream)
      })

      it('join incomplete product from one chunk to the next', (done) => {
        const product1 = '{"product": "my-great-hoodie"}'
        const halfProduct = '{"first": "brok'
        const anotherHalf = 'en-product"}'
        const product3 = '{"anotherProduct": "comfortable-shoes"}'
        const myChunk1 = `${product1}${midMarker}${halfProduct}`
        const myChunk2 = `${anotherHalf}${midMarker}${product3}${endMarker}`
        const expected1 = [JSON.parse(product1)]
        const expected2 = [ { first: 'broken-product' }, JSON.parse(product3)]
        const inputStream = streamTest.fromChunks([myChunk1, myChunk2])

        inputStream.on('end', () => {
          expect(jsonParserProduct._resolveReferences).toHaveBeenCalledTimes(2)
          expect(jsonParserProduct._resolveReferences).toBeCalledWith(expected1)
          expect(jsonParserProduct._resolveReferences).toBeCalledWith(expected2)
          done()
        })
        jsonParserProduct.parse(inputStream)
      })
    })
  })

  describe('Resolvers', () => {
    let sampleProduct
    beforeEach(() => {
      sampleProduct = {
        id: 'myProduct-1',
        productType: { id: 'fake-product-type' },
        taxCategory: { id: 'fake-tax-category' },
        state: { id: 'fake-state' },
        categories: [{ id: 'fake-cat-1' }, { id: 'fake-cat-2' }],
        categoryOrderHints: { 'fake-cat-1': '0.012', 'fake-cat-2': '0.987' },
      }
    })

    describe('::_resolveReferences', () => {
      beforeEach(() => {
        jsonParserProduct._resolveProductType = jest.fn(() => (
          { productType: 'resolved-product-type' }
        ))
        jsonParserProduct._resolveTaxCategory = jest.fn(() => (
          { taxCategory: 'resolved-tax-category' }
        ))
        jsonParserProduct._resolveState = jest.fn(() => (
          { state: 'resolved-state' }
        ))
        jsonParserProduct._resolveCategories = jest.fn(() => (
          { categories: ['resolved-cat-1', 'resolved-cat-2'] }
        ))
        jsonParserProduct._resolveCategoryOrderHints = jest.fn(() => (
          { categoryOrderHints: ['res-cat-1':'0.012', 'res-cat-2':'0.987'] }
        ))
      })

      it('should pass the products to all resolver functions', async () => {
        await jsonParserProduct._resolveReferences([sampleProduct])

        expect(jsonParserProduct._resolveProductType)
          .toBeCalledWith(sampleProduct)
        expect(jsonParserProduct._resolveTaxCategory)
          .toBeCalledWith(sampleProduct)
        expect(jsonParserProduct._resolveState)
          .toBeCalledWith(sampleProduct)
        expect(jsonParserProduct._resolveCategories)
          .toBeCalledWith(sampleProduct)
        expect(jsonParserProduct._resolveCategoryOrderHints)
          .toBeCalledWith(sampleProduct)
      })

      it('should return object with resolved refeences', async () => {
        const expected = [{
          id: 'myProduct-1',
          productType: 'resolved-product-type',
          taxCategory: 'resolved-tax-category',
          state: 'resolved-state',
          categories: ['resolved-cat-1', 'resolved-cat-2'],
          categoryOrderHints: ['res-cat-1':'0.012', 'res-cat-2':'0.987'],
        }]
        const actual = await jsonParserProduct._resolveReferences([sampleProduct])
        expect(actual).toEqual(expected)
      })
    })

    describe('::_resolveProductType', () => {
      beforeEach(() => {
        jsonParserProduct.fetchReferences = jest.fn(() => (
          Promise.resolve({ body: { name: 'resolved-name' } })
        ))
      })

      it('return empty object if no `productType` reference', () => {
        delete sampleProduct.productType
        expect(jsonParserProduct._resolveProductType(sampleProduct)).toEqual({})
      })

      it('build correct request uri for productType', async () => {
        const expected = /project-key\/product-types\/fake-product-type/
        await jsonParserProduct._resolveProductType(sampleProduct)
        expect(jsonParserProduct.fetchReferences)
          .toBeCalledWith(expect.stringMatching(expected))
      })

      it('return productType name if `productType` reference', async () => {
        const expected = { productType: 'resolved-name' }
        const actual = await jsonParserProduct
          ._resolveProductType(sampleProduct)
        expect(actual).toEqual(expected)
      })
    })

    describe('::_resolveTaxCategory', () => {
      beforeEach(() => {
        jsonParserProduct.fetchReferences = jest.fn(() => (
          Promise.resolve({ body: { key: 'resolved-key' } })
        ))
      })

      it('return empty object if no `taxCategory` reference', () => {
        delete sampleProduct.taxCategory
        expect(jsonParserProduct._resolveTaxCategory(sampleProduct)).toEqual({})
      })

      it('build correct request uri for taxCategory', async () => {
        const expected = /project-key\/tax-categories\/fake-tax-category/
        await jsonParserProduct._resolveTaxCategory(sampleProduct)
        expect(jsonParserProduct.fetchReferences)
          .toBeCalledWith(expect.stringMatching(expected))
      })

      it('return taxCategory key if `taxCategory` reference', async () => {
        const expected = { taxCategory: 'resolved-key' }
        const actual = await jsonParserProduct
          ._resolveTaxCategory(sampleProduct)
        expect(actual).toEqual(expected)
      })

      it('return taxCategory name if `taxCategory` has no key', async () => {
        jsonParserProduct.fetchReferences
          .mockReturnValue(Promise.resolve({ body: { name: 'resolved-name' } }))
        const expected = { taxCategory: 'resolved-name' }
        const actual = await jsonParserProduct
          ._resolveTaxCategory(sampleProduct)
        expect(actual).toEqual(expected)
      })
    })

    describe('::_resolveState', () => {
      beforeEach(() => {
        jsonParserProduct.fetchReferences = jest.fn(() => (
          Promise.resolve({ body: { key: 'resolved-key' } })
        ))
      })

      it('return empty object if no `state` reference', () => {
        delete sampleProduct.state
        expect(jsonParserProduct._resolveState(sampleProduct)).toEqual({})
      })

      it('build correct request uri for state', async () => {
        const expected = /project-key\/states\/fake-state/
        await jsonParserProduct._resolveState(sampleProduct)
        expect(jsonParserProduct.fetchReferences)
          .toBeCalledWith(expect.stringMatching(expected))
      })

      it('return state key if `state` reference', async () => {
        const expected = { state: 'resolved-key' }
        const actual = await jsonParserProduct
          ._resolveState(sampleProduct)
        expect(actual).toEqual(expected)
      })
    })
  })

  describe('::fetchReferences', () => {
    beforeEach(() => {
      jsonParserProduct.client.execute = jest.fn()
    })
    it('should fetch reference from API from url', () => {
      const uri = 'dummy-uri'
      const expectedRequest = {
        uri,
        method: 'GET',
        headers: { Authorization: 'Bearer myAccessToken' },
      }

      jsonParserProduct.fetchReferences(uri)
      expect(jsonParserProduct.client.execute).toBeCalled()
      expect(jsonParserProduct.client.execute).toBeCalledWith(expectedRequest)
    })

    it('should fetch only once for multiple calls with same parameter', () => {
      const uri = 'dummy-uri-2'
      const expectedRequest = {
        uri,
        method: 'GET',
        headers: { Authorization: 'Bearer myAccessToken' },
      }

      jsonParserProduct.fetchReferences(uri)
      jsonParserProduct.fetchReferences(uri)
      expect(jsonParserProduct.client.execute).toHaveBeenCalledTimes(1)
      expect(jsonParserProduct.client.execute).toBeCalledWith(expectedRequest)
    })
  })
})
