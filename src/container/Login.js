import axios from "axios";
import { Button, Card, ErrorMessage, FlexCenter, Input, Title } from '../style/style';
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";

const apiURL = process.env.REACT_APP_API_URL;

const Login = () => {
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
          id: "8ffe38cd42c8c20b",
          name: "John Doe"
        }
    });

    const onSubmit = data => {
        axios.post(`${apiURL}/login`, {
          "name": data.name,
          "apiKey": data.id
        }).then(resp => {
          localStorage.setItem('userData', JSON.stringify({
            image: `${apiURL}/${resp.data.image}`,
            token: resp.data.token
          }))
          navigate('/');
        }).catch(error => {
            console.log(error.response.data.msg)
        })
    }

    useEffect(() => {
        if(localStorage.getItem("userData")) {
            navigate('/')
        }
    }, [navigate])

    return (<form onSubmit={handleSubmit(onSubmit)}>
        <FlexCenter>
            <Card gap="12px" style={{
                padding: "24px 24px 33px 24px"
            }}>
                <Title style={{ paddingBottom: "12px" }}>Login</Title>
                <Controller
                    control={control}
                    name="id"
                    render={({ field }) => <Input {...field} placeholder="Id" type="text" /> }
                    rules={{ required: true }}
                />
                { errors.id && <ErrorMessage>Id is required</ErrorMessage> }
                <Controller
                    control={control}
                    name="name"
                    render={({ field }) => <Input {...field} placeholder="Name" type="text" /> }
                    rules={{ required: true }}
                />
                { errors.name && <ErrorMessage>Name is required</ErrorMessage> }
                <Button className="full" type="submit">Login</Button>
            </Card>
        </FlexCenter>
    </form>)
}

export default Login;