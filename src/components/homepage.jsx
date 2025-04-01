"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import Link from "next/link";

// Importação dinâmica do Leaflet para evitar erro no SSR
const L = typeof window !== "undefined" ? require("leaflet") : null;

export default function Homepage() {
    const mapRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);
    const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
    const [geolocationAvailable, setGeolocationAvailable] = useState(false);

    // Função que adiciona o marcador do usuário no mapa
    const addUserMarker = ({ lat, lng }) => {
        const userIcon = L.icon({
            iconUrl: "/assets/images/user.svg",
            iconSize: [58, 68],
            iconAnchor: [29, 68],
            popupAnchor: [170, 2],
        });

        L.marker([lat, lng], { icon: userIcon }).addTo(mapRef.current);
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            setGeolocationAvailable(true);
        }
    }, []);

    useEffect(() => {
        if (geolocationAvailable) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    if (mapRef.current) {
                        mapRef.current.setView(
                            [
                                position.coords.latitude,
                                position.coords.longitude,
                            ],
                            15
                        );
                        // Adiciona o marcador do usuário
                        addUserMarker({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    }
                },
                (error) => {
                    console.error("Erro ao obter a localização:", error);
                }
            );
        }
    }, [geolocationAvailable]);

    useEffect(() => {
        if (isMounted && typeof window !== "undefined" && !mapRef.current) {
            const mapElement = document.getElementById("map-container");
            if (!mapElement || !L) return;

            const map = L.map("map-container").setView(
                [-22.9066619, -47.0864879],
                13
            );
            mapRef.current = map;

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            const icon = L.icon({
                iconUrl: "/assets/images/marker.svg",
                iconSize: [58, 68],
                iconAnchor: [29, 68],
                popupAnchor: [170, 2],
            });

            // Função para adicionar outros marcadores, como os de centros
            const addMarker = ({ id, name, lat, lng, image }) => {
                const popup = L.popup({
                    closeButton: false,
                    className: "map-popup",
                    minWidth: 240,
                    minHeight: 240,
                }).setContent(
                    `${name} <a href="/center?id=${id}"><img src="/assets/images/arrow-white.svg"></a>`
                );

                L.marker([lat, lng], { icon }).addTo(map).bindPopup(popup);
            };

            const centers = [
                {
                    id: 1,
                    name: "Bazar Beneficente",
                    lat: "-22.9068",
                    lng: "-47.0870",
                    image: "https://lh3.googleusercontent.com/p/AF1QipM_adPt42dSYQ2_2PeDjZaGPcyy9yk8x9oI3SfB=s680-w680-h510",
                },
                {
                    id: 2,
                    name: "Hemocentro Mario Gatti",
                    lat: "-22.9172901",
                    lng: "-47.0696961",
                    image: "https://lh3.googleusercontent.com/p/AF1QipPhFlEpVsMOI0ml6oL2ApGeHRVohfooZwAFzxxz=s680-w680-h510",
                },
            ];

            centers.forEach((orphanage) => {
                if (!isNaN(orphanage.lat) && !isNaN(orphanage.lng)) {
                    addMarker(orphanage);
                }
            });

            // Atualizar a localização quando o mapa for movido
            map.on("moveend", () => {
                const center = map.getCenter();
                setUserLocation({
                    lat: center.lat,
                    lng: center.lng,
                });
            });

            return () => {
                map.remove();
                mapRef.current = null;
            };
        }
    }, [isMounted]);

    return (
        <>
            <div id="donation-page">
                <aside className="donation-sidebar animate-main">
                    <header>
                        <h1 className="sidebar-title">Kindmap</h1>
                        <Image
                            src={"/logo.svg"}
                            width={50}
                            height={50}
                            alt="Logo Kindmap"
                            className="logo-image"
                        />
                    </header>
                    <main>
                        <h2 className="section-subtitle">
                            Encontre um centro de doação próximo
                        </h2>
                        <p className="donation-verse">
                            Mais bem-aventurado é dar do que recebe
                        </p>
                        <Image
                            src={"/assets/images/donation.svg"}
                            width={200}
                            height={200}
                            alt="Doação"
                            className="donation-image"
                        />
                    </main>
                    <footer className="sidebar-footer">
                        {userLocation.lat && userLocation.lng ? (
                            <>
                                Latitude: {userLocation.lat.toFixed(4)}
                                <br />
                                Longitude: {userLocation.lng.toFixed(4)}
                            </>
                        ) : (
                            "Carregando localização..."
                        )}
                    </footer>
                </aside>

                <div id="map-container" className="animate-appear"></div>

                {/* <Link
                    href="/"
                    className="add-donation-center"
                    title="Cadastrar um centro"
                >
                    <Image
                        src={"/assets/images/plus.svg"}
                        width={25}
                        height={25}
                        alt="Criar centro"
                    />
                </Link> */}
            </div>
        </>
    );
}
