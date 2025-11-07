import { Control, FieldPath } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import {z} from "zod";
import { authFormSchema } from "@/lib/utils";

const formSchema = authFormSchema("sign-up");

interface CustomInputProps {
    control: Control<z.infer<typeof formSchema>>;
    name: FieldPath<z.infer<typeof formSchema>>;
    label: string;
    placeholder: string;
}

const CustomInput = ({control, name, label, placeholder} : CustomInputProps) => {
    return (
        <FormItem>
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <div className="form-item">
                        <FormLabel className="form-label">{label}</FormLabel>
                        <div className="flex flex-col w-full ">
                            <FormControl>
                                <Input
                                    placeholder={placeholder}
                                    className="input-class placeholder:text-14"
                                    type={name === "password" ? "password" : "text"}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="form-message mt-2" />
                        </div>
                    </div>
                )}
            />
        </FormItem>
    )
}

export default CustomInput;