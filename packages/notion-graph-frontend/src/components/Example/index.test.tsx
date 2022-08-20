/* eslint-disable @typescript-eslint/ban-ts-comment */
import { mount, shallow } from "enzyme"
import React from "react"
import { ExampleImpure, ExamplePure } from "."
import axios from "axios"
import waitForExpect from "wait-for-expect"

jest.mock(`axios`)
const loremIpsum = `lorem ipsum`

describe(`ExampleImpure`, () => {
  let axiosGetCalledTimes = 0

  it(`should show loading text when first mounted`, async () => {
    // @ts-ignore
    axios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: loremIpsum })
    )

    const component = mount(<ExampleImpure color={`#FFF333`} />)
    axiosGetCalledTimes += 1
    expect(component.text()).toEqual(expect.stringContaining(`loading`))
  })
  it(`should show error text when network request throws error`, async () => {
    // @ts-ignore
    axios.get.mockImplementationOnce(() =>
      Promise.reject(new Error(`Network Error`))
    )

    const mounted = mount(<ExampleImpure color={`#FFF333`} />)
    axiosGetCalledTimes += 1
    await waitForExpect(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.any(String))
      expect(axios.get).toHaveBeenCalledTimes(axiosGetCalledTimes)
    })
    expect(mounted.text()).toEqual(expect.stringContaining(`error`))
  })
  it(`should show lorem ipsum text when there is no network error`, async () => {
    // @ts-ignore
    axios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: loremIpsum })
    )

    const mounted = mount(<ExampleImpure color={`#FFF333`} />)
    axiosGetCalledTimes += 1

    await waitForExpect(async () => {
      expect(axios.get).toHaveBeenCalledWith(expect.any(String))
      expect(axios.get).toHaveBeenCalledTimes(axiosGetCalledTimes)
    })
    mounted.update()
    expect(mounted.text()).not.toEqual(expect.stringContaining(`error`))
    expect(mounted.text()).not.toEqual(expect.stringContaining(`loading`))
    expect(mounted.text()).toEqual(loremIpsum)
  })
})

describe(`ExamplePure`, () => {
  it(`should render ExamplePure component without error`, () => {
    expect(() => shallow(<ExamplePure color={`#FFF333`} />)).not.toThrow()
  })
})
