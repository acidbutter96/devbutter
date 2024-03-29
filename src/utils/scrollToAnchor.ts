const scrollToAnchor = (offset: number = 0) => {
    return (anchor: string) => {
        if (!(typeof window === "undefined")) {
            const hash = anchor
            const startWithHashRegex = /^#\w+/g
            const targetElement = document?.querySelector(`${hash}`)

            if (!startWithHashRegex.test(hash) || !targetElement) {
                return
            }

            const elementPosition = targetElement.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.scrollY - offset

            const scroll = () => {
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                })
            }

            scroll()

            requestAnimationFrame(scroll)
        }
    }
}

export default scrollToAnchor