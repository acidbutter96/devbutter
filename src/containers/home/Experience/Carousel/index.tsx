import Carousel from "react-multi-carousel";
import styles from "./styles.module.scss";
import "react-multi-carousel/lib/styles.css";

const CarouselBuilder = ({ images }: { images: object }): React.JSX.Element => {
    const responsive = {
        superLargeDesktop: {
            // the naming can be any, depends on you.
            breakpoint: { max: 4000, min: 3000 },
            items: 7
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 5
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 4
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 2
        }
    };
    return <div className={styles.carouselContainer}>
        <Carousel
            responsive={responsive}
            swipeable={false}
            draggable={true}
            ssr={true} // means 
            arrows={false}
            infinite={true}
            // autoPlay={this.props.deviceType !== "mobile" ? true : false}
            autoPlaySpeed={1000}
            keyBoardControl={true}
            customTransition="all .5"
            transitionDuration={500}
            containerClass={styles.carouselContainer}
            // deviceType={this.props.deviceType}
            itemClass={styles.carouselItem}
        >
            <div>Item 1</div>
            <div>Item 2</div>
            <div>Item 3</div>
            <div>Item 4</div>
            <div>Item 5</div>
            <div>Item 6</div>
            <div>Item 7</div>
        </Carousel>
    </div>
}

export default CarouselBuilder