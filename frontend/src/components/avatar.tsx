import { useUserValue } from "../hooks/user"

function Avatar() {
    const user = useUserValue()

    return (
        <div className="flex items-center">
            <img src={user.picture as string} alt="Avatar" className="w-12 h-12 rounded-full" />
            <div className="ml-3">
                <p className="text-gray-500">{user.name}</p>
            </div>
        </div>

    )
}

export default Avatar