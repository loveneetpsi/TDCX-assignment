import { useEffect, useRef } from "react";
import { Card, ModalContainer } from "../style/style"

const Modal = (props) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                props.onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [props, modalRef])

    return (
        <ModalContainer show={props.show || false}>
            <Card
                ref={modalRef}
                gap="12px"
                style={{
                    padding: "24px 24px 29px 24px"
                }}
            >
                {props.children}
            </Card>
        </ModalContainer>
    )
}

export default Modal;