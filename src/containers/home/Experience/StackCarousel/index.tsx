import Carousel from "react-multi-carousel";
import styles from "./styles.module.scss";
import "react-multi-carousel/lib/styles.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { StackListResponse } from "@/pages/api/stackList";
import Image from "next/image";
// import { useEffect, useState } from "react";

interface StacksInterface {
    title: string;
    link?: string;
    src: string;
}

const StackCarousel = ({ images }: { images: object }): React.JSX.Element => {
    const [stacks, setStacks] = useState<StacksInterface[]>([]);

    const fetchData = async (directory: string, exceptions: { rule: string, new: string }[] | null = null): Promise<StackListResponse[]> => {
        try {
            const response = await axios.post<StackListResponse[]>(
                '/api/stackList', { directory, exceptions }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    };

    useEffect(() => {
        const directory: string = "./public/static/images/stacks/"
        fetchData(directory, [
            {
                rule: "dbeaver",
                new: "dbeaver",
            },
            {
                rule: "aws",
                new: "AWS",
            },
            {
                rule: "devops",
                new: "DevOps",
            },
            {
                rule: "fastapi",
                new: "FastAPI",
            },
            {
                rule: "mysql",
                new: "MySQL",
            },
            {
                rule: "php",
                new: "PHP",
            },
            {
                rule: "python_poetry",
                new: "Poetry",
            },
        ]).then((res): any => {
            console.log("aqui o grande erro", res);
            setStacks(res);
        });
    }, []);

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
            swipeable={true}
            draggable
            ssr={true} // means 
            infinite
            keyBoardControl={true}
            minimumTouchDrag={80}
            arrows={false}
            focusOnSelect={false}
            autoPlay
            autoPlaySpeed={4000}
            customTransition="all 1s linear"
            transitionDuration={1}
            containerClass={styles.carouselContainer}
            itemClass={styles.carouselItem}
        >
            {
                !!stacks.length ? stacks.map((stack, index) => <div key={index} >
                    <div className={styles.skillImage}>
                        <Image
                            src={stack.src}
                            alt={stack.title}
                            width={0}
                            height={0}
                            title={stack.title}
                        />
                    </div>
                </div>) : <></>
            }
        </Carousel>
    </div>
}

export default StackCarousel